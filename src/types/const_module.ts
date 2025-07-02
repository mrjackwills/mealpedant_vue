import { ConstT } from '@/types';

export const ModuleName = {
	Admin: 'admin',
	Browser: 'browser',
	Dialog: 'dialog',
	Drawer: 'drawer',
	Footer: 'footer',
	Infobar: 'infobar',
	Loading: 'loading',
	Meal: 'meal',
	MealView: 'mealView',
	ResetPassword: 'resetPassword',
	Snack: 'snackbar',
	TableData: 'tableData',
	TwoFa: 'twoFA',
	User: 'user'
} as const;

export type ModuleName = ConstT<typeof ModuleName>;
