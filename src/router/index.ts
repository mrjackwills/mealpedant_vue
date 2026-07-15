import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from 'vue-router'
import EmptyComponent from '@/components/EmptyComponent.vue'
import { fetch_admin, fetch_authenticatedUser, fetch_incognito } from '@/services/fetch'
import { snackError, snackSuccess } from '@/services/snack'
import { type PV, TPerson } from '@/types'
import { FrontEndNames, FrontEndRoutes } from '@/types/const_routes'
import { isPerson } from '@/types/typeGuards'
import Home from '@/views/HomeView.vue'

async function init_check (): PV {
	const BrowserStore = browserModule()
	const init = BrowserStore.init
	if (!init) {
		loadingModule().set_loading(true)
		try {
			if (userModule().authenticated) {
				await fetch_authenticatedUser.authenticated_get()
			}
			if (userModule().admin) {
				await fetch_admin.admin_get()
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error)
		}
	}
	BrowserStore.set_init(true)
	loadingModule().set_loading(false)
}

async function adminBefore (_to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<undefined | string> {
	await init_check()
	const isAuthenticated = !!userModule().admin && !!userModule().authenticated
	return isAuthenticated ? undefined : FrontEndRoutes.BASE
}

async function adminEditMeal (to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<undefined | string> {
	try {
		const dateRegex = /[12]\d{3}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])/
		if (to.query.date && to.query.person) {
			const person = to.query.person.toString()
			if (isPerson(person)) {
				const dateValid = dateRegex.test(to.query.date.toString())
				if (dateValid) {
					adminModule().set_date(to.query.date.toString())
					adminModule().set_person(person)
					return
				} else {
					return FrontEndRoutes.ERROR
				}
			} else {
				return FrontEndRoutes.ERROR
			}
		} else {
			const personValid = adminModule().person === TPerson.JACK || adminModule().person === TPerson.DAVE
			const dateValid = dateRegex.test(adminModule().date)
			return personValid && dateValid ? undefined : FrontEndRoutes.ERROR
		}
	} catch {
		return FrontEndRoutes.BASE
	}
}

const adminRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.ADMIN,
		name: FrontEndNames.ADMIN,
		component: () => import('@/views/AuthenticatedAdmin/AdminView.vue'),
		beforeEnter: [adminBefore],
	},
	{
		path: FrontEndRoutes.ADMIN_PHOTO,
		name: FrontEndNames.ADMIN_PHOTO,
		component: () => import('@/views/AuthenticatedAdmin/AdminPhotos.vue'),
		beforeEnter: [adminBefore],
	},
	{
		path: FrontEndRoutes.ADDMEAL,
		name: FrontEndNames.ADDMEAL,
		component: () => import('@/views/AuthenticatedAdmin/SingleMeal.vue'),
		beforeEnter: [adminBefore],

	},
	{
		path: FrontEndRoutes.EDITMEAL,
		name: FrontEndNames.EDITMEAL,
		component: () => import('@/views/AuthenticatedAdmin/SingleMeal.vue'),
		beforeEnter: [adminBefore, adminEditMeal],
	},
]

const authedRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.SETTINGS,
		name: FrontEndRoutes.SETTINGS,
		component: () => import('@/views/Authenticated/SettingsView.vue'),
	},
]

for (const route of authedRoutes) {
	route.beforeEnter = async (_to, _from): Promise<undefined | string> => {
		await init_check()
		const isAuthenticated = userModule().authenticated
		return isAuthenticated ? undefined : FrontEndRoutes.BASE
	}
}

async function notAuthedBefore (_to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<undefined | string> {
	await init_check()
	const isAuthenticated = userModule().authenticated
	return isAuthenticated ? FrontEndRoutes.BASE : undefined
}
async function hexPasswordReset (to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<string> {
	const secret = String(to.params?.id)
	if (!secret || secret.length !== 128) {
		snackError({ message: 'Invalid verification data' })
		return FrontEndRoutes.BASE
	} else {
		const LoadingStore = loadingModule()
		LoadingStore.set_loading(true)
		const success = await fetch_incognito.reset_get(secret)
		LoadingStore.set_loading(false)
		if (success) {
			return FrontEndRoutes.USER_RESET
		} else {
			resetPasswordModule().set_id(undefined)
			return FrontEndRoutes.BASE
		}
	}
}

async function hexReset (_to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<undefined | string> {
	return resetPasswordModule().id ? undefined : FrontEndRoutes.ERROR
}

async function hexRegister (to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<string> {
	if (to.params.id?.length !== 128) {
		snackError({ message: 'Invalid verification data' })
	}
	const success = await fetch_incognito.verify_get(String(to.params.id))
	if (success) {
		snackSuccess({ message: 'verified, please sign in to continue' })
		return FrontEndRoutes.SIGNIN
	} else {
		return FrontEndRoutes.BASE
	}
}
const hexRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.RESETPASSWORD_param_ID,
		name: FrontEndNames.USER_RESET_ID,
		component: EmptyComponent,
		beforeEnter: [notAuthedBefore, hexPasswordReset],
	},
	{
		path: FrontEndRoutes.USER_RESET,
		name: FrontEndNames.USER_RESET,
		component: () => import('@/views/HexAuthenticated/ResetView.vue'),
		beforeEnter: [notAuthedBefore, hexReset],

	},

	{
		// / Verify user after successful register - componentless
		path: FrontEndRoutes.USER_VERIFY_param_ID,
		name: FrontEndNames.USER_VERIFY_param_ID,
		component: EmptyComponent,
		beforeEnter: [notAuthedBefore, hexRegister],
	},
]

const notAuthedRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.SIGNIN,
		name: FrontEndNames.SIGNIN,
		component: () => import('@/views/NotAuthenticated/SigninView.vue'),
		beforeEnter: [notAuthedBefore],
	},
	{
		path: FrontEndRoutes.REGISTER,
		name: FrontEndNames.REGISTER,
		component: () => import('@/views/NotAuthenticated/RegisterView.vue'),
		beforeEnter: [notAuthedBefore],
	},
	{
		path: FrontEndRoutes.FORGOTPASSWORD,
		name: FrontEndNames.FORGOTPASSWORD,
		component: () => import('@/views/NotAuthenticated/ForgotPassword.vue'),
		beforeEnter: [notAuthedBefore],
	},
]

async function baseBefore (_to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<undefined> {
	await init_check()
}

async function baseMealBefore (_to: RouteLocationNormalized, _from: RouteLocationNormalized): Promise<undefined | string> {
	const isAuthenticated = userModule().authenticated
	return isAuthenticated ? FrontEndRoutes.MEALS : undefined
}

const baseRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.MEALS,
		name: FrontEndRoutes.MEALS,
		component: () => import('@/views/MealView.vue'),
		beforeEnter: [baseBefore],
	},
	{
		path: FrontEndRoutes.BASE,
		name: FrontEndNames.HOME,
		component: Home,
		beforeEnter: [baseBefore, baseMealBefore],
	},
	{
		path: FrontEndRoutes.ERROR,
		name: FrontEndNames.ERROR,
		component: () => import('@/views/ErrorView.vue'),
		beforeEnter: [baseBefore],
	},
	{
		path: FrontEndRoutes.CATCH_ALL,
		redirect: { name: FrontEndNames.ERROR },
	},
]

const allRoutes = [...adminRoutes, ...authedRoutes, ...notAuthedRoutes, ...hexRoutes, ...baseRoutes]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: allRoutes,
	scrollBehavior (to, from, savedPosition) {
		// / Need to ignore changes in params, so just check names
		if (to.name === from.name) {
			return
		}
		return savedPosition ?? { top: 0 }
	},
})

export default router
