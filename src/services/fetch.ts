import type * as types from '@/types'
import { HttpCode } from '@/types/const_http'
import { isHttpCode } from '@/types/typeGuards'
import { env } from '@/vanillaTS/env'
import { snackError } from './snack'

type ErrorData = { data: { response: string } }

class HttpError extends Error {
	response?: { status: number, data: any }

	constructor (message: string, response?: { status: number, data: any }) {
		super(message)
		this.name = 'HttpError'
		this.response = response
	}
}

const BASE_HEADERS: Record<string, string> = {
	Accept: 'application/json',
	'Content-Type': 'application/json; charset=utf-8',
	'Cache-control': 'no-cache',
}

const REQUEST_TIMEOUT = 60_000

async function fetchRequest (
	baseURL: string,
	method: string,
	path: string,
	body?: any,
	responseType: 'json' | 'arraybuffer' = 'json',
): Promise<{ data: any, status: number }> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

	try {
		const isFormData = body instanceof FormData
		const headers: Record<string, string> = isFormData
			? { 'Cache-control': 'no-cache' }
			: { ...BASE_HEADERS }

		const init: RequestInit = {
			method,
			credentials: 'include',
			headers,
			signal: controller.signal,
			...(body !== undefined && { body: isFormData ? body : JSON.stringify(body) }),
		}

		const url = new URL(path, baseURL.endsWith('/') ? baseURL : `${baseURL}/`).href
		const response = await fetch(url, init)

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ response: 'unable to access server' }))
			throw new HttpError(`HTTP ${response.status}`, { status: response.status, data: errorData })
		}

		if (responseType === 'arraybuffer') {
			return { data: await response.arrayBuffer(), status: response.status }
		}
		let parsed = {}
		try {
			const text = await response.text()
			parsed = text ? JSON.parse(text) : {}
		} catch {
			parsed = { response: 'invalid json response' }
		}
		return { data: parsed, status: response.status }
	} catch (error) {
		if (error instanceof HttpError) {
			throw error
		}
		throw new Error('offline', { cause: error })
	} finally {
		clearTimeout(timeoutId)
	}
}

function createClient (baseURL: string, responseType: 'json' | 'arraybuffer' = 'json') {
	return {
		get: (path: string) =>
			fetchRequest(baseURL, 'GET', path, undefined, responseType),

		post: (path: string, body?: any) =>
			fetchRequest(baseURL, 'POST', path, body, responseType),

		patch: (path: string, body?: any) =>
			fetchRequest(baseURL, 'PATCH', path, body, responseType),

		put: (path: string, body?: any) =>
			fetchRequest(baseURL, 'PUT', path, body, responseType),

		delete: (path: string, body?: any) =>
			fetchRequest(baseURL, 'DELETE', path, body, responseType),
	}
}

const baseFetch = createClient(env.domain_api)
const staticFetch = createClient(env.domain_static, 'arraybuffer')

function isAuthenticated (fn: any, _context: ClassMethodDecoratorContext) {
	async function wrapped (this: any, ...args: any[]) {
		if (userModule().authenticated) {
			return await fn.call(this, ...args)
		}
		snackError({ message: 'invalid authentication' })
	}
	return wrapped
}

function isNotAuthenticated (fn: any, _context: ClassMethodDecoratorContext) {
	async function wrapped (this: any, ...args: any[]) {
		if (userModule().authenticated) {
			snackError({ message: 'invalid authentication' })
		} else {
			return await fn.call(this, ...args)
		}
	}
	return wrapped
}

function isAdmin (fn: any, _context: ClassMethodDecoratorContext) {
	async function wrapped (this: any, ...args: any[]) {
		if (userModule().authenticated && userModule().admin) {
			return await fn.call(this, ...args)
		}
		snackError({ message: 'invalid authentication' })
	}
	return wrapped
}

function wrap (fn: any, _context: ClassMethodDecoratorContext) {
	async function wrapped (this: any, ...args: any[]) {
		try {
			return await fn.apply(this, args)
		} catch (error) {
			loadingModule().set_loading(false)
			const e = error as HttpError

			if (e.message === 'offline') {
				const BrowserStore = browserModule()
				if (BrowserStore.online) {
					snackError({ message: 'server offline' })
				}
				BrowserStore.set_online(false)
				return
			}

			if (e.response?.status === HttpCode.FORBIDDEN) {
				userModule().clear_email_admin()
				userModule().clientSideSignout()
				snackError({ message: 'you have been signed out' })
				return
			}

			if (e.response?.status === HttpCode.TOO_MANY_REQUESTS) {
				const p = e.response as unknown as ErrorData
				snackError({ message: p.data.response })
				return
			}

			const p = e?.response as unknown as ErrorData
			snackError({ message: p?.data?.response ?? 'unable to access server' })
		}
	}
	return wrapped
}

class Incognito {
	readonly #url = 'incognito'

	@wrap
	@isNotAuthenticated
	async verify_get (verifyId: string): types.PB {
		await baseFetch.get(`${this.#url}/verify/${verifyId}`)
		return true
	}

	@wrap
	async online_get (): types.PB {
		const response = await baseFetch.get(`${this.#url}/online`)
		const BrowserStore = browserModule()
		BrowserStore.set_online(true)
		BrowserStore.set_api_version(response.data.response.api_version)
		return true
	}

	@wrap
	@isNotAuthenticated
	async register_post (registerObject: types.TRegisterUser): Promise<string> {
		const response = await baseFetch.post(`${this.#url}/register`, registerObject)
		return response?.data?.response
	}

	@wrap
	@isNotAuthenticated
	async reset_get (hexId: string): types.PB {
		const { data } = await baseFetch.get(`${this.#url}/reset/${hexId}`)
		const resetStore = resetPasswordModule()
		resetStore.set_id(hexId)
		resetStore.set_two_fa_backup(data.response.two_fa_backup)
		resetStore.set_two_fa_active(data.response.two_fa_active)
		return true
	}

	@wrap
	@isNotAuthenticated
	async reset_patch ({ resetId, password, token }: types.TPasswordPatch): types.PB {
		await baseFetch.patch(`${this.#url}/reset/${resetId}`, { password, token: token ?? undefined })
		return true
	}

	@wrap
	@isNotAuthenticated
	async resetPassword_post (email: string): Promise<types.su> {
		const response = await baseFetch.post(`${this.#url}/reset`, { email })
		return response?.data?.response
	}

	@wrap
	@isNotAuthenticated
	async signin_post (authObject: types.TSignin): Promise<types.u<types.TSigninResponse>> {
		const response = await baseFetch.post(`${this.#url}/signin`, authObject)
		if (isHttpCode(response.status)) {
			return { response: response.data.response, status: response.status }
		}
	}

	@wrap
	async meals_get (): Promise<types.c_MealInfo> {
		const response = await baseFetch.get(`${this.#url}/meals`)
		return response.data.response
	}

	async mealhash_get (): Promise<string> {
		const response = await baseFetch.get(`${this.#url}/hash`)
		return response.data.response
	}
}

class AuthenticatedUser {
	readonly #url = 'user'

	@wrap
	async signout_post (): types.PV {
		await baseFetch.post(`${this.#url}/signout`)
	}

	@wrap
	@isAuthenticated
	async authenticated_get (): types.PV {
		const response = await baseFetch.get(`${this.#url}`)
		const TwoFAStore = twoFAModule()
		const UserStore = userModule()
		await Promise.all([
			UserStore.set_email(response.data.response.email),
			UserStore.set_admin(response.data.response.admin),
			TwoFAStore.set_backup_count(response.data.response.two_fa_count),
			TwoFAStore.set_alwaysRequired(response.data.response.two_fa_always_required),
			TwoFAStore.set_active(response.data.response.two_fa_active),
		])
	}

	@wrap
	@isAuthenticated
	async password_patch (passwordObject: types.TPasswordChange): types.PB {
		await baseFetch.patch(`${this.#url}/password`, passwordObject)
		return true
	}

	@wrap
	@isAuthenticated
	async twoFA_delete (authObject: types.TAuthObject): types.PB {
		await baseFetch.delete(`${this.#url}/twofa`, authObject)
		await this.authenticated_get()
		return true
	}

	@wrap
	@isAuthenticated
	async twoFA_patch (authObject: types.TAuthObject): Promise<Array<string> | undefined> {
		const response = await baseFetch.patch(`${this.#url}/twofa`, authObject)
		return response?.data?.response?.backups as Array<string>
	}

	@wrap
	@isAuthenticated
	async twoFA_post (): Promise<Array<string> | undefined> {
		const response = await baseFetch.post(`${this.#url}/twofa`)
		return response?.data?.response?.backups
	}

	@wrap
	@isAuthenticated
	async twoFA_put (authObject: types.TAuthObject): types.PB {
		await baseFetch.put(`${this.#url}/twofa`, authObject)
		await this.authenticated_get()
		return true
	}

	@wrap
	@isAuthenticated
	async setupTwoFA_get (): Promise<string> {
		const response = await baseFetch.get(`${this.#url}/setup/twofa`)
		return response.data.response.secret as string
	}

	@wrap
	@isAuthenticated
	async setupTwoFA_delete (): types.PV {
		await baseFetch.delete(`${this.#url}/setup/twofa`)
	}

	@wrap
	@isAuthenticated
	async setupTwoFA_patch (body: types.TTFASetupPatch): types.PB {
		await baseFetch.patch(`${this.#url}/setup/twofa`, body)
		await this.authenticated_get()
		return true
	}

	@wrap
	@isAuthenticated
	async setupTwoFA_post (token: types.TToken): types.PB {
		await baseFetch.post(`${this.#url}/setup/twofa`, token)
		return true
	}
}

class AuthenticatedFood {
	readonly #url = 'food'

	@wrap
	@isAuthenticated
	async all_get (): Promise<types.c_MealInfo> {
		const response = await baseFetch.get(`${this.#url}/all`)
		return response.data.response
	}

	@wrap
	@isAuthenticated
	async mealhash_get (): Promise<string> {
		const response = await baseFetch.get(`${this.#url}/hash`)
		return response.data.response
	}
}

class Admin {
	readonly #url = 'admin'

	@wrap
	@isAdmin
	async backup_get (): types.PV {
		const response = await baseFetch.get(`${this.#url}/backup`)
		adminModule().set_backup(response?.data?.response.backups)
	}

	@wrap
	@isAdmin
	async backup_delete (file_name: string): types.PB {
		await baseFetch.delete(`${this.#url}/backup`, { file_name })
		return true
	}

	@wrap
	@isAdmin
	async backup_post (with_photos: boolean): types.PB {
		await baseFetch.post(`${this.#url}/backup`, { with_photos })
		return true
	}

	@wrap
	@isAuthenticated
	async cache_delete (): types.PV {
		await baseFetch.delete(`${this.#url}/cache`)
	}

	@wrap
	@isAdmin
	async email_get (): types.PB {
		const response = await baseFetch.get(`${this.#url}/email`)
		adminModule().set_email(response.data.response)
		return true
	}

	@wrap
	@isAdmin
	async email_post (emailData: types.TSendEmail): types.PB {
		await baseFetch.post(`${this.#url}/email`, emailData)
		return true
	}

	@wrap
	@isAdmin
	async logs_get (): types.PB {
		const response = await baseFetch.get(`${this.#url}/logs`)
		adminModule().set_logs(response.data.response)
		return true
	}

	@wrap
	@isAdmin
	async limit_get (): types.PB {
		const response = await baseFetch.get(`${this.#url}/limit`)
		adminModule().set_limit(response.data.response)
		return true
	}

	@wrap
	@isAdmin
	async limit_delete (body: types.TUserLimit): types.PB {
		await baseFetch.delete(`${this.#url}/limit`, body)
		await this.limit_get()
		return true
	}

	@wrap
	@isAdmin
	async memory_get (): types.PB {
		const response = await baseFetch.get(`${this.#url}/memory`)
		adminModule().set_memory(response.data.response)
		return true
	}

	@wrap
	@isAdmin
	async photo_get (): types.PV {
		const response = await baseFetch.get(`${this.#url}/photo`)
		adminModule().set_all_photos(response.data.response)
	}

	@wrap
	@isAdmin
	async photo_delete (name: string): types.PV {
		await baseFetch.delete(`${this.#url}/photo/${name}`)
	}

	@wrap
	@isAdmin
	async restart_put (authObject: types.TAuthObject): types.PV {
		await baseFetch.put(`${this.#url}/restart`, authObject)
	}

	@wrap
	@isAdmin
	async session_get (email: string): Promise<Array<types.TAdminSession>> {
		const response = await baseFetch.get(`${this.#url}/session/${email}`)
		return response.data.response as Array<types.TAdminSession>
	}

	@wrap
	@isAdmin
	async session_delete (uuid: string): types.PV {
		await baseFetch.delete(`${this.#url}/session/${uuid}`)
	}

	@wrap
	@isAdmin
	async user_get (): types.PV {
		const response = await baseFetch.get(`${this.#url}/user`)
		for (const i of response.data.response) {
			i.meta = { expanded: undefined, sessions: undefined }
		}
		adminModule().set_registeredUsers(response.data.response)
	}

	@wrap
	@isAdmin
	async user_patch (userData: types.TAdminPatch): types.PB {
		await baseFetch.patch(`${this.#url}/user`, userData)
		return true
	}

	async admin_get (): types.PV {
		await baseFetch.get(`${this.#url}`)
	}
}

class AdminMeal {
	readonly #url = 'meal'

	@wrap
	@isAdmin
	async missing_get (): types.PV {
		const response = await baseFetch.get(`${this.#url}/missing`)
		for (const i of response.data.response) {
			infobarModule().add_message({
				message: `${`${i.date}`.slice(0, 10)} missing for ${i.person}`,
				color: 'infobar',
			})
		}
	}

	@wrap
	@isAdmin
	async singleMeal_get (data: types.TSingleMeal): Promise<undefined | types.TMealDatePerson> {
		const response = await baseFetch.get(`${this.#url}/${data.date}/${data.person}`)
		return response?.data?.response?.meal
	}

	@wrap
	@isAdmin
	async meal_delete (body: types.TMealDelete): types.PB {
		await baseFetch.delete(`${this.#url}/${body.date}/${body.person}`, body.auth)
		return true
	}

	@wrap
	@isAdmin
	async meal_patch (mealObject: types.TMealPatch): types.PB {
		await baseFetch.patch(this.#url, mealObject)
		return true
	}

	@wrap
	@isAdmin
	async meal_post (meal: types.TMealDatePerson): types.PB {
		await baseFetch.post(this.#url, { ...meal })
		return true
	}
}

export class AdminPhoto {
	readonly #url = 'photo'

	@wrap
	@isAdmin
	async photo_delete (body: types.TPhotoLong): types.PB {
		await baseFetch.delete(this.#url, body)
		return true
	}

	@wrap
	@isAdmin
	async photo_post (photoData: FormData): Promise<types.TPhotoLong | undefined> {
		const response = await baseFetch.post(this.#url, photoData)
		return response.data.response
	}
}

class DownloadPhoto {
	@wrap
	@isAuthenticated
	async photo_get (url: string): Promise<ArrayBuffer> {
		const response = await staticFetch.get(url)
		return response.data as ArrayBuffer
	}
}

export const fetch_admin = new Admin()
export const fetch_adminMeal = new AdminMeal()
export const fetch_adminPhoto = new AdminPhoto()
export const fetch_authenticatedFood = new AuthenticatedFood()
export const fetch_authenticatedUser = new AuthenticatedUser()
export const fetch_downloadPhoto = new DownloadPhoto()
export const fetch_incognito = new Incognito()
