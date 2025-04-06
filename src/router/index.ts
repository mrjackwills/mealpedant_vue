import { axios_admin, axios_authenticatedUser, axios_incognito } from '@/services/axios';
import type { PV } from '@/types';
import Home from '@/views/HomeView.vue';
import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized, type RouteRecordRaw } from 'vue-router';
import { FrontEndNames, FrontEndRoutes } from '@/types/const_routes';
import EmptyComponent from '@/components/EmptyComponent.vue';
import { snackError, snackSuccess } from '@/services/snack';


const init_check = async (): PV => {
	const BrowserStore = browserModule();
	const init = BrowserStore.init;
	if (!init) {
		loadingModule().set_loading(true);
		try {
			if (userModule().authenticated) await axios_authenticatedUser.authenticated_get();
			if (userModule().admin) await axios_admin.admin_get();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.log(e);
		}
	}
	BrowserStore.set_init(true);
	loadingModule().set_loading(false);

};

const adminBefore = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	await init_check();
	const isAuthenticated = !!userModule().admin && !!userModule().authenticated;
	if (isAuthenticated) {
		next();
	} else {
		next(FrontEndRoutes.BASE);
	}
};

const adminEditMeal = async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	try {
		const dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

		if (to.query.date && to.query.person) {
			const personValid = to.query.person.toString() === 'Jack' || to.query.person.toString() === 'Dave';
			const dateValid = dateRegex.test(to.query.date.toString());
			if (personValid && dateValid) {
				adminModule().set_date(to.query.date.toString());
				adminModule().set_person(to.query.person.toString());
				next();
			} else next(FrontEndRoutes.ERROR);
		} else {

			const personValid = adminModule().person === 'Jack' || adminModule().person === 'Dave';
			const dateValid = dateRegex.test(adminModule().date);
			if (personValid && dateValid) next();
			else next(FrontEndRoutes.ERROR);
		}
	} catch (_e) {
		next(FrontEndRoutes.BASE);
	}
};

const adminRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.ADMIN,
		name: FrontEndNames.ADMIN,
		component: () => import('@/views/AuthenticatedAdmin/AdminView.vue'),
		beforeEnter: [adminBefore]
	},
	{
		path: FrontEndRoutes.ADMIN_PHOTO,
		name: FrontEndNames.ADMIN_PHOTO,
		component: () => import('@/views/AuthenticatedAdmin/AdminPhotos.vue'),
		beforeEnter: [adminBefore]
	},
	{
		path: FrontEndRoutes.ADDMEAL,
		name: FrontEndNames.ADDMEAL,
		component: () => import('@/views/AuthenticatedAdmin/SingleMeal.vue'),
		beforeEnter: [adminBefore]

	},
	{
		path: FrontEndRoutes.EDITMEAL,
		name: FrontEndNames.EDITMEAL,
		component: () => import('@/views/AuthenticatedAdmin/SingleMeal.vue'),
		beforeEnter: [adminBefore, adminEditMeal]
	}
];

const authedRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.SETTINGS,
		name: FrontEndRoutes.SETTINGS,
		component: () => import('@/views/Authenticated/SettingsView.vue')
	}
];

for (const route of authedRoutes) {
	route.beforeEnter = async (_to, _from, next): PV => {
		await init_check();
		const isAuthenticated = userModule().authenticated;
		if (isAuthenticated) {
			next();
		} else {
			next(FrontEndRoutes.BASE);
		}
	};
}

const notAuthedBefore = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	try {
		await init_check();
	} finally {
		const isAuthenticated = userModule().authenticated;
		if (isAuthenticated) {
			next(FrontEndRoutes.BASE);
		} else {
			next();

		}
	}

};
const hexPasswordReset = async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	const secret = String(to.params?.id);
	if (!secret || secret.length !== 128) {
		snackError({ message: 'Invalid verification data' });
		next(FrontEndRoutes.BASE);
	} else {
		const LoadingStore = loadingModule();
		LoadingStore.set_loading(true);
		const success = await axios_incognito.reset_get(secret);
		LoadingStore.set_loading(false);
		if (success) next(FrontEndRoutes.USER_RESET);
		else {
			resetPasswordModule().set_id(undefined);
			next(FrontEndRoutes.BASE);
		}
	}
};

const hexReset = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	if (!resetPasswordModule().id) {
		next(FrontEndRoutes.ERROR);
	} else {
		next();
	}
};

const hexRegister = async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	if (to.params.id?.length !== 128) snackError({ message: 'Invalid verification data' });
	const success = await axios_incognito.verify_get(String(to.params.id));
	if (success) {
		snackSuccess({ message: 'verified, please sign in to continue' });
		next(FrontEndRoutes.SIGNIN);
	} else {
		next(FrontEndRoutes.BASE);
	}
};
const hexRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.RESETPASSWORD_param_ID,
		name: FrontEndNames.USER_RESET_ID,
		component: EmptyComponent,
		beforeEnter: [notAuthedBefore, hexPasswordReset]
	},
	{
		path: FrontEndRoutes.USER_RESET,
		name: FrontEndNames.USER_RESET,
		component: () => import('@/views/HexAuthenticated/ResetView.vue'),
		beforeEnter: [notAuthedBefore, hexReset]

	},

	{
		/// Verify user after successful register - componentless
		path: FrontEndRoutes.USER_VERIFY_param_ID,
		name: FrontEndNames.USER_VERIFY_param_ID,
		component: EmptyComponent,
		beforeEnter: [notAuthedBefore, hexRegister]
	}
];


const notAuthedRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.SIGNIN,
		name: FrontEndNames.SIGNIN,
		component: () => import('@/views/NotAuthenticated/SigninView.vue'),
		beforeEnter: [notAuthedBefore]
	},
	{
		path: FrontEndRoutes.REGISTER,
		name: FrontEndNames.REGISTER,
		component: () => import('@/views/NotAuthenticated/RegisterView.vue'),
		beforeEnter: [notAuthedBefore]
	},
	{
		path: FrontEndRoutes.FORGOTPASSWORD,
		name: FrontEndNames.FORGOTPASSWORD,
		component: () => import('@/views/NotAuthenticated/ForgotPassword.vue'),
		beforeEnter: [notAuthedBefore]
	}
];



const baseBefore = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	try {
		await init_check();
	} finally {
		next();
	}
};


const baseMealBefore = async (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext): PV => {
	const isAuthenticated = userModule().authenticated;
	if (isAuthenticated) {
		next(FrontEndRoutes.MEALS);
	} else {
		next();
	}
};

const baseRoutes: Array<RouteRecordRaw> = [
	{
		path: FrontEndRoutes.MEALS,
		name: FrontEndRoutes.MEALS,
		component: () => import('@/views/MealView.vue'),
		beforeEnter: [baseBefore]
	},
	{
		path: FrontEndRoutes.BASE,
		name: FrontEndNames.HOME,
		component: Home,
		beforeEnter: [baseBefore, baseMealBefore]
	},
	{
		path: FrontEndRoutes.ERROR,
		name: FrontEndNames.ERROR,
		component: () => import('@/views/ErrorView.vue'),
		beforeEnter: [baseBefore]
	},
	{
		path: FrontEndRoutes.CATCH_ALL,
		redirect: { name: FrontEndNames.ERROR }
	}
];

const allRoutes = [...adminRoutes, ...authedRoutes, ...notAuthedRoutes, ...hexRoutes, ...baseRoutes];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: allRoutes,
	scrollBehavior (to, from, savedPosition) {
		/// Need to ignore changes in params, so just check names
		if (to.name === from.name) return;
		return savedPosition ?? { top: 0 };

	}
});

export default router;
