import { env } from '@/vanillaTS/env';
import { isHttpCode } from '@/types/typeGuards';
import { snackError } from './snack';
import * as types from '@/types';
import Axios, { type AxiosInstance, AxiosError } from 'axios';
import { HttpCode } from '@/types/const_http';

type ErrorData = { data: { response: string } };

type AxiosClasses = Admin | AdminMeal | AdminPhoto | AuthenticatedFood | AuthenticatedUser | DownloadPhoto | Incognito;

const baseAxios: AxiosInstance = Axios.create({
	baseURL: env.domain_api,
	withCredentials: true,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-control': 'no-cache'
	},
	timeout: 60000
});

const staticAxios: AxiosInstance = Axios.create({
	baseURL: env.domain_static,
	withCredentials: true,
	responseType: 'arraybuffer'
});

for (const i of [baseAxios, staticAxios]) {
	i.interceptors.response.use((config) => Promise.resolve(config), (error) => !error.response ? Promise.reject(new Error('offline')) : Promise.reject(error));
}

const isAuthenticated = <T>() => {
	return function (_target: AxiosClasses, _propertyKey: string, descriptor: PropertyDescriptor): void {
		const original = descriptor.value;
		descriptor.value = async function (t: T): Promise<unknown> {
			const authenticated = userModule().authenticated;
			if (authenticated) {
				const result = await original.call(this, t);
				return result;
			} else snackError({ message: 'invalid authentication' });
			return;
		};
	};
};

const isNotAuthenticated = <T>() => {
	return function (_target: AxiosClasses, _propertyKey: string, descriptor: PropertyDescriptor): void {
		const original = descriptor.value;
		descriptor.value = async function (t: T): Promise<unknown> {
			const authenticated = userModule().authenticated;
			if (!authenticated) {
				const result = await original.call(this, t);
				return result;
			} else snackError({ message: 'invalid authentication' });
			return;
		};
	};
};

const isAdmin = <T>() => {
	return function (_target: AxiosClasses, _propertyKey: string, descriptor: PropertyDescriptor): void {
		const original = descriptor.value;
		descriptor.value = async function (t: T): Promise<unknown> {
			const admin = userModule().authenticated && userModule().admin;
			if (admin) {
				const result = await original.call(this, t);
				return result;
			} else snackError({ message: 'invalid authentication' });
			return;
		};
	};
};

const wrap = <T>() => {
	return function (_target: AxiosClasses, _propertyKey: string, descriptor: PropertyDescriptor): void {
		const original = descriptor.value;
		descriptor.value = async function (t: T): Promise<unknown> {
			try {
				const result = await original.call(this, t);
				return result;
			} catch (err) {
				loadingModule().set_loading(false);
				const e = err as AxiosError;
				if (e.message === 'offline') {
					const BrowserStore = browserModule();
					if (BrowserStore.online) snackError({ message: 'server offline' });
					BrowserStore.set_online(false);
					return;
				} else if (e.response?.status === HttpCode.FORBIDDEN) {
					userModule().clear_email_admin();
					userModule().clientSideSignout();
					snackError({ message: 'you have been signed out' });
					return;
				} else if (e.response?.status === HttpCode.TOO_MANY_REQUESTS) {
					const p = e.response as ErrorData;
					snackError({ message: p.data.response });
					return;
				} else {
					const p = e?.response as ErrorData;
					const eeee = p.data?.response ?? 'unable to access server';
					snackError({ message: eeee });
				}
				return;
			}
		};
	};
};

class Incognito {
	readonly #url = 'incognito';

	@wrap()
	async online_get (): types.PB {
		const response = await baseAxios.get(`${this.#url}/online`);
		const BrowserStore = browserModule();
		BrowserStore.set_online(true);
		BrowserStore.set_api_version(response.data.response.api_version);
		return true;
	}

	@wrap<types.TRegisterUser>()
	@isNotAuthenticated<types.TRegisterUser>()
	async register_post (registerObject: types.TRegisterUser): Promise<string> {
		const response = await baseAxios.post(`${this.#url}/register`, registerObject);
		return response?.data?.response;
	}

	@wrap<string>()
	@isNotAuthenticated()
	async reset_get (hexId: string): types.PB {
		const { data } = await baseAxios.get(`${this.#url}/reset/${hexId}`);
		const resetStore = resetPasswordModule();
		resetStore.set_id(hexId);
		resetStore.set_two_fa_backup(data.response.two_fa_backup);
		resetStore.set_two_fa_active(data.response.two_fa_active);
		return true;
	}

	@wrap<types.TPasswordPatch>()
	@isNotAuthenticated()
	async reset_patch ({ resetId, password, token }: types.TPasswordPatch): types.PB {
		await baseAxios.patch(`${this.#url}/reset/${resetId}`, {
			password,
			token: token ?? undefined
		});
		return true;
	}

	@wrap<string>()
	@isNotAuthenticated()
	async resetPassword_post (email: string): Promise<types.su> {
		const response = await baseAxios.post(`${this.#url}/reset`, { email });
		return response?.data?.response;
	}

	@wrap<types.TSignin>()
	@isNotAuthenticated<types.TSignin>()
	async signin_post (authObject: types.TSignin): Promise<types.u<types.TSigninResponse>> {
		const response = await baseAxios.post(`${this.#url}/signin`, authObject);
		if (isHttpCode(response.status)) {
			return {
				response: response.data.response,
				status: response.status
			};
		}
	}

	@wrap()
	async meals_get (): Promise<types.c_MealInfo> {
		const response = await baseAxios.get(`${this.#url}/meals`);
		return response.data.response;
	}

	async mealhash_get (): Promise<string> {
		const response = await baseAxios.get(`${this.#url}/hash`);
		return response.data.response;
	}

	@wrap()
	@isNotAuthenticated()
	async verify_get (verifyId: string): types.PB {
		await baseAxios.get(`${this.#url}/verify/${verifyId}`);
		return true;
	}
}

class AuthenticatedUser {
	readonly #url = 'user';

	@wrap()
	async signout_post (): types.PV {
		await baseAxios.post(`${this.#url}/signout`);
	}

	@wrap()
	@isAuthenticated()
	async authenticated_get (): types.PV {
		const response = await baseAxios.get(`${this.#url}`);
		const TwoFAStore = twoFAModule();
		const UserStore = userModule();
		await Promise.all([
			UserStore.set_email(response.data.response.email),
			UserStore.set_admin(response.data.response.admin),
			TwoFAStore.set_backup_count(response.data.response.two_fa_count),
			TwoFAStore.set_alwaysRequired(response.data.response.two_fa_always_required),
			TwoFAStore.set_active(response.data.response.two_fa_active)
		]);
	}

	@wrap<types.TPasswordChange>()
	@isAuthenticated<types.TPasswordChange>()
	async password_patch (passwordObject: types.TPasswordChange): types.PB {
		await baseAxios.patch(`${this.#url}/password`, passwordObject);
		return true;
	}

	@wrap()
	@isAuthenticated<types.TAuthObject>()
	async twoFA_delete (authObject: types.TAuthObject): types.PB {
		await baseAxios.delete(`${this.#url}/twofa`, { data: authObject });
		await this.authenticated_get();
		return true;
	}

	@wrap<types.TAuthObject>()
	@isAuthenticated<types.TAuthObject>()
	async twoFA_patch (authObject: types.TAuthObject): Promise<Array<string> | undefined> {
		const response = await baseAxios.patch(`${this.#url}/twofa`, authObject);
		return response?.data?.response?.backups as Array<string>;
	}

	@wrap()
	@isAuthenticated()
	async twoFA_post (): Promise<Array<string> | undefined> {
		const response = await baseAxios.post(`${this.#url}/twofa`);
		return response?.data?.response?.backups;
	}

	@wrap<types.TAuthObject>()
	@isAuthenticated<types.TAuthObject>()
	async twoFA_put (authObject: types.TAuthObject): types.PB {
		await baseAxios.put(`${this.#url}/twofa`, authObject);
		await this.authenticated_get();
		return true;
	}

	@wrap()
	@isAuthenticated()
	async setupTwoFA_get (): Promise<string> {
		const response = await baseAxios.get(`${this.#url}/setup/twofa`);
		return response.data.response.secret as string;
	}

	@wrap()
	@isAuthenticated()
	async setupTwoFA_delete (): types.PV {
		await baseAxios.delete(`${this.#url}/setup/twofa`);
	}

	@wrap<types.TTFASetupPatch>()
	@isAuthenticated<types.TTFASetupPatch>()
	async setupTwoFA_patch (body: types.TTFASetupPatch): types.PB {
		await baseAxios.patch(`${this.#url}/setup/twofa`, body);
		await this.authenticated_get();
		return true;
	}

	@wrap<types.TToken>()
	@isAuthenticated<types.TToken>()
	async setupTwoFA_post (token: types.TToken): types.PB {
		await baseAxios.post(`${this.#url}/setup/twofa`, token);
		return true;
	}
}

class AuthenticatedFood {
	readonly #url = 'food';

	@wrap()
	@isAuthenticated()
	async all_get (): Promise<types.c_MealInfo> {
		const response = await baseAxios.get(`${this.#url}/all`);
		return response.data.response;
	}

	@wrap()
	@isAuthenticated()
	async mealhash_get (): Promise<string> {
		const response = await baseAxios.get(`${this.#url}/hash`);
		return response.data.response;
	}
}

class Admin {
	readonly #url = 'admin';

	// Does this need a decorator?
	async admin_get (): types.PV {
		await baseAxios.get(`${this.#url}`);
	}

	@wrap()
	@isAdmin()
	async backup_get (): types.PV {
		const response = await baseAxios.get(`${this.#url}/backup`);
		adminModule().set_backup(response?.data?.response.backups);
	}

	@wrap()
	@isAdmin()
	async backup_delete (file_name: string): types.PB {
		await baseAxios.delete(`${this.#url}/backup`, { data: { file_name } });
		return true;
	}

	@wrap()
	@isAdmin()
	async backup_post (with_photos: boolean): types.PB {
		await baseAxios.post(`${this.#url}/backup`, { with_photos });
		return true;
	}

	@wrap()
	@isAuthenticated()
	async cache_delete (): types.PV {
		await baseAxios.delete(`${this.#url}/cache`);
	}

	@wrap()
	@isAdmin()
	async email_get (): types.PB {
		const response = await baseAxios.get(`${this.#url}/email`);
		adminModule().set_email(response.data.response);
		return true;
	}

	@wrap()
	@isAdmin()
	async email_post (emailData: types.TSendEmail): types.PB {
		await baseAxios.post(`${this.#url}/email`, emailData);
		return true;
	}

	@wrap()
	@isAdmin()
	async logs_get (): types.PB {
		const response = await baseAxios.get(`${this.#url}/logs`);
		adminModule().set_logs(response.data.response);
		return true;
	}

	@wrap()
	@isAdmin()
	async limit_get (): types.PB {
		const response = await baseAxios.get(`${this.#url}/limit`);
		adminModule().set_limit(response.data.response);
		return true;
	}

	@wrap()
	@isAdmin()
	async limit_delete (data: types.TUserLimit): types.PB {
		await baseAxios.delete(`${this.#url}/limit`, { data });
		await this.limit_get();
		return true;
	}

	@wrap()
	@isAdmin()
	async memory_get (): types.PB {
		const response = await baseAxios.get(`${this.#url}/memory`);
		adminModule().set_memory(response.data.response);
		return true;
	}

	@wrap()
	@isAdmin()
	async photo_get (): types.PV {
		const response = await baseAxios.get(`${this.#url}/photo`);
		adminModule().set_all_photos(response.data.response);
	}

	@wrap()
	@isAdmin()
	async photo_delete (name: string): types.PV {
		await baseAxios.delete(`${this.#url}/photo/${name}`);
	}

	@wrap()
	@isAdmin()
	async restart_put (authObject: types.TAuthObject): types.PV {
		await baseAxios.put(`${this.#url}/restart`, authObject);
	}

	@wrap()
	@isAdmin()
	async session_get (email: string): Promise<Array<types.TAdminSession>> {
		const response = await baseAxios.get(`${this.#url}/session/${email}`);
		return response.data.response as Array<types.TAdminSession>;
	}

	@wrap()
	@isAdmin()
	async session_delete (uuid: string): types.PV {
		await baseAxios.delete(`${this.#url}/session/${uuid}`);
	}

	@wrap()
	@isAdmin()
	async user_get (): types.PV {
		const response = await baseAxios.get(`${this.#url}/user`);
		for (const i of response.data.response) i.meta = {
			expanded: undefined,
			sessions: undefined
		};
		adminModule().set_registeredUsers(response.data.response);
	}

	@wrap()
	@isAdmin()
	async user_patch (userData: types.TAdminPatch): types.PB {
		await baseAxios.patch(`${this.#url}/user`, userData);
		return true;
	}
}

class AdminMeal {
	readonly #url = 'meal';

	@wrap()
	@isAdmin()
	async missing_get (): types.PV {
		const response = await baseAxios.get(`${this.#url}/missing`);
		for (const i of response.data.response) infobarModule().add_message({
			message: `${`${i.date}`.substring(0, 10)} missing for ${i.person}`,
			color: 'infobar'
		});
	}

	@wrap()
	@isAdmin()
	async singleMeal_get (data: types.TSingleMeal): Promise<undefined | types.TMealDatePerson> {
		const response = await baseAxios.get(`${this.#url}/${data.date}/${data.person}`);
		return response?.data?.response?.meal;
	}

	@wrap()
	@isAdmin()
	async meal_delete (data: types.TMealDelete): types.PB {
		await baseAxios.delete(`${this.#url}/${data.date}/${data.person}`, { data: data.auth });
		return true;
	}

	@wrap()
	@isAdmin()
	async meal_patch (mealObject: types.TMealPatch): types.PB {
		await baseAxios.patch(this.#url, mealObject);
		return true;
	}

	@wrap()
	@isAdmin()
	async meal_post (meal: types.TMealDatePerson): types.PB {
		await baseAxios.post(this.#url, { ...meal });
		return true;
	}
}

export class AdminPhoto {
	readonly #url = 'photo';

	@wrap()
	@isAdmin()
	async photo_delete (deleteData: types.TPhotoLong): types.PB {
		await baseAxios.delete(this.#url, { data: deleteData });
		return true;
	}

	@wrap()
	@isAdmin()
	async photo_post (photoData: FormData): Promise<types.TPhotoLong | undefined> {
		const response = await baseAxios.post(this.#url, photoData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'Cache-control': 'no-cache'
			}
		});
		return response.data.response;
	}
}

class DownloadPhoto {
	@wrap()
	@isAuthenticated<string>()
	async photo_get (url: string): Promise<ArrayBuffer> {
		const response = await staticAxios.get(url, { withCredentials: true });
		return response.data as ArrayBuffer;
	}
}

export const axios_admin = new Admin();
export const axios_adminMeal = new AdminMeal();
export const axios_adminPhoto = new AdminPhoto();
export const axios_authenticatedFood = new AuthenticatedFood();
export const axios_authenticatedUser = new AuthenticatedUser();
export const axios_downloadPhoto = new DownloadPhoto();
export const axios_incognito = new Incognito();
