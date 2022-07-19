/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { axios_incognito, axios_admin, axios_authenticatedUser, axios_authenticatedFood } from '@/services/axios';
import { browserModule, loadingModule, resetPasswordModule, userModule } from '@/store';
import { PiniaVuePlugin } from 'pinia';
import { Position } from 'vue-router/types/router';
import { PV } from '@/types';
import { snackError, snackSuccess } from '@/services/snack';
import Home from '@/views/Home.vue';
import Router, { RouteConfig } from 'vue-router';
import Vue from 'vue';

Vue.use(PiniaVuePlugin);
Vue.use(Router);

const init_check = async (): PV => {
	const BrowserStore = browserModule();
	const init = BrowserStore.init;
	if (!init) {
		loadingModule().set_loading(true);
		await axios_incognito.online_get();
		const isAuthenticated = userModule().authenticated;
		if (isAuthenticated) await axios_authenticatedUser.authenticated_get();
		const isAdmin = userModule().admin;
		if (isAdmin) await axios_admin.admin_get();
	}
	BrowserStore.set_init(true);
	loadingModule().set_loading(false);

};

const adminRoutes: Array<RouteConfig> = [
	{
		path: '/admin',
		name: 'admin',
		component: () => import(/* webpackChunkName: "a" */ '@/views/AdminAuthenticated/Admin.vue'),
		beforeEnter: async (_to, _from, next): PV => {
			const isAdmin = userModule().admin;
			isAdmin ? next(): next('/error');
		}
	},
	{
		path: '/addmeal',
		name: 'addmeal',
		component: () => import(/* webpackChunkName: "am" */ '@/views/AdminAuthenticated/AddMeal.vue'),
		beforeEnter: async (_to, _from, next): PV => {
			const isAdmin = userModule().admin;
			isAdmin ? next(): next('/error');
		}
	},
	{
		path: '/editmeal',
		name: 'editmeal',
		component: () => import(/* webpackChunkName: "em" */ '@/views/AdminAuthenticated/EditMeal.vue'),
		beforeEnter: async (to, _from, next): PV => {
			try {
				const isAdmin = userModule().admin;
				if (!isAdmin) return next('/error');
				const dateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
				const personValid = to.query.p === 'Jack' || to.query.p === 'Dave';
				const dateValid = dateRegex.test(to.query.d as string);
				if (personValid && dateValid) next();
				else next('/error');
			} catch (e) {
				next('/');
			}
		}
	},
	{
		path: '/flushcache',
		name: 'flushcache',
		beforeEnter: async (_to, from, next): PV => {
			try {
				const isAdmin = userModule().admin;
				if (isAdmin) await axios_authenticatedFood.cache_delete();
				next(from.path);
			} catch (e) {
				const message = e instanceof Error ? e.message : 'ERROR: flushcache';
				snackError({ message });
				next('/');
			}
		},
	}
];

const authedRoutes: Array<RouteConfig> = [
	{
		path: '/meals',
		name: 'meals',
		component: () => import(/* webpackChunkName: "m" */ '@/views/Authenticated/Meal.vue'),
	},
	{
		path: '/settings',
		name: 'settings',
		component: () => import(/* webpackChunkName: "s" */ '@/views/Authenticated/Settings.vue'),
	}
];

for (const route of authedRoutes) {
	route.beforeEnter = (_to, _from, next): void => {
		const isAuthenticated = userModule().authenticated;
		isAuthenticated ? next(): next('/');
	};
}

const hexRoutes: Array<RouteConfig> = [
	{
		path: '/user/reset/:id',
		name: 'resetID',
		beforeEnter: async (to, _from, next): PV => {
			const isAuthenticated = userModule().authenticated;
			if (isAuthenticated) {
				next('/');
			} else {
				// TODO need to change this,
				if (to.params.id?.length !== 128) throw Error('Invalid verification data');
				const LoadingStore = loadingModule();
				LoadingStore.set_loading(true);
				const success = await axios_incognito.reset_get(to.params.id);
				if (success) next('/user/reset');
				else {
					resetPasswordModule().set_id(undefined);
					next('/');
				}
				LoadingStore.set_loading(false);
			}
		}
	},
	{
		path: '/user/reset/',
		name: 'reset',
		component: () => import(/* webpackChunkName: "rp" */ '@/views/HexAuthenticated/Reset.vue'),
		beforeEnter: (_to, _from, next): void => {
			const isAuthenticated = userModule().authenticated;
			const resetId = resetPasswordModule().id;
			if (isAuthenticated || !resetId) {
				next('/error');
			} else {
				next();
			}
		}
	},
	{
		/** Verify user after successful register - componentless */
		path: '/user/verify/:id',
		name: 'verify',
		beforeEnter: async (to, _from, next): PV => {
			const isAuthenticated = userModule().authenticated;
			if (isAuthenticated) {
				next('/');
			} else {
				if (to.params.id?.length !== 128) throw Error('Invalid verification data');
				const success = await axios_incognito.verify_get(to.params.id);
				if (success) {
					next('/signin');
					snackSuccess({ message: 'Verified, please sign in to continue' });
				}
				next('/');
			}
		}
	},
];

const notAuthedRoutes: Array<RouteConfig> = [
	{
		path: '/signin',
		name: 'signin',
		component: () => import(/* webpackChunkName: "si" */ '@/views/NotAuthenticated/Signin.vue'),
	},
	{
		path: '/register',
		name: 'register',
		component: () => import(/* webpackChunkName: "r" */ '@/views/NotAuthenticated/Register.vue'),
	},
	{
		path: '/forgotpassword',
		name: 'forgotpassword',
		component: () => import(/* webpackChunkName: "fp" */ '@/views/NotAuthenticated/ForgotPassword.vue'),
	},
];

for (const route of notAuthedRoutes) {
	route.beforeEnter = (_to, _from, next): void => {
		const isAuthenticated = userModule().authenticated;
		isAuthenticated ? next('/') : next();
	};
}

const baseRoutes: Array<RouteConfig> = [
	{
		path: '/',
		name: 'home',
		component: Home,
		beforeEnter: async (_to, _from, next): PV => {
			const isAuthenticated = userModule().authenticated;
			if (isAuthenticated) {
				next('/meals');
			} else {
				next();
			}
		},
	},
	{
		path: '/error',
		name: 'error',
		component: () => import(/* webpackChunkName: "e" */ '@/views/Error.vue'),
	},
	{
		path: '*',
		redirect: { name: 'error' },
	},
];

const routes = [ ...baseRoutes, ...adminRoutes, ...authedRoutes, ...hexRoutes, ...notAuthedRoutes ];

export const router = new Router({
	mode: 'history',
	base: '/',
	scrollBehavior (_to, _from, savedPosition): void|Position {
		return savedPosition ?? { x: 0, y: 0 };
	},
	routes,
	
});

router.beforeEach(async (_to, _from, next) => {
	await init_check();
	// TODO remove all queries?
	next();
});
