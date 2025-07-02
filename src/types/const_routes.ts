import { ConstT } from '@/types';

export const FrontEndRoutes = {
	ADDMEAL: '/addmeal',
	ADMIN_PHOTO: '/admin/photo',
	ADMIN: '/admin',
	BASE: '/',
	CATCH_ALL: '/:catchAll(.*)',
	EDITMEAL: '/editmeal',
	ERROR: '/error',
	FORGOTPASSWORD: '/forgotpassword',
	MEALS: '/meals',
	REGISTER: '/register',
	RESETPASSWORD_param_ID: '/user/reset/:id',
	SETTINGS: '/settings',
	SIGNIN: '/signin',
	USER_RESET: '/user/reset',
	USER_VERIFY_param_ID: '/user/verify/:id'
} as const;
export type FrontEndRoutes = ConstT<typeof FrontEndRoutes>;

export const FrontEndNames = {
	ADDMEAL: 'addmeal',
	ADMIN_PHOTO: 'admin_photo',
	ADMIN: 'admin',
	EDITMEAL: 'editmeal',
	ERROR: 'error',
	FORGOTPASSWORD: 'forgot-password',
	HOME: 'home',
	MEALS: 'meals',
	REGISTER: 'register',
	SETTINGS: 'settings',
	SIGNIN: 'signin',
	USER_RESET_ID: 'user_reset_id',
	USER_RESET: 'user_reset',
	USER_VERIFY_param_ID: 'user_verify_id'
} as const;
export type FrontEndNames = ConstT<typeof FrontEndNames>;
