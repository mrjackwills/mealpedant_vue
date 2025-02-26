export const ModuleName = {
	Admin: 'admin' as const,
	Browser: 'browser' as const,
	Categories: 'categories' as const,
	Dialog: 'dialog' as const,
	Drawer: 'drawer' as const,
	Food: 'food' as const,
	Footer: 'footer' as const,
	Infobar: 'infobar' as const,
	Loading: 'loading' as const,
	Meals: 'meals' as const,
	ResetPassword: 'resetPassword' as const,
	Selectors: 'selectors' as const,
	Snack: 'snackbar' as const,
	TableData: 'tableData' as const,
	TwoFa: 'twoFA' as const,
	Types: 'types' as const,
	User: 'user' as const
};

export type ModuleName = (typeof ModuleName)[keyof typeof ModuleName]; 