import { ConstT } from '@/types';

export const ModuleName = {
	Admin: 'admin' as const,
	Browser: 'browser' as const,
	Dialog: 'dialog' as const,
	Drawer: 'drawer' as const,
	Footer: 'footer' as const,
	Infobar: 'infobar' as const,
	Loading: 'loading' as const,
	Meal: 'meal' as const,
	MealView: 'mealView' as const,
	ResetPassword: 'resetPassword' as const,
	Snack: 'snackbar' as const,
	TableData: 'tableData' as const,
	TwoFa: 'twoFA' as const,
	User: 'user' as const
};

export type ModuleName = ConstT<typeof ModuleName>;