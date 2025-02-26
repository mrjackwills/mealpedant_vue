export const FrontEndRoutes = {
	ADDMEAL: '/addmeal' as const,
	ADMIN: '/admin' as const,
	BASE: '/' as const,
	CATCH_ALL: '/:catchAll(.*)' as const,
	EDITMEAL: '/editmeal' as const,
	ERROR: '/error' as const,
	FLUSH_CACHE: '/flushcache' as const,
	FORGOTPASSWORD: '/forgotpassword' as const,
	MEALS: '/meals' as const,
	REGISTER: '/register' as const,
	RESETPASSWORD_param_ID: '/user/reset/:id' as const,
	SETTINGS: '/settings' as const,
	SIGNIN: '/signin' as const,
	USER_RESET: '/user/reset' as const,
	USER_VERIFY_param_ID: '/user/verify/:id' as const
};
export type FrontEndRoutes = (typeof FrontEndRoutes)[keyof typeof FrontEndRoutes]; 

export const FrontEndNames = {
	ADDMEAL: 'addmeal' as const,
	ADMIN: 'admin' as const,
	EDITMEAL: 'editmeal' as const,
	ERROR: 'error' as const,
	FLUSH_CACHE: 'flush_cache' as const,
	FORGOTPASSWORD: 'forgot-password' as const,
	HOME: 'home' as const,
	REGISTER: 'register' as const,
	SETTINGS: 'settings' as const,
	SIGNIN: 'signin' as const,
	USER_RESET: 'user_reset' as const,
	USER_RESET_ID: 'user_reset_id' as const,
	USER_VERIFY_param_ID: 'user_verify_id' as const
};
export type FrontEndNames = (typeof FrontEndRoutes)[keyof typeof FrontEndRoutes]; 