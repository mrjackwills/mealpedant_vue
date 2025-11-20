import { defineStore } from 'pinia'
import router from '@/router'
import { axios_authenticatedUser } from '@/services/axios'
import { ModuleName } from '@/types/const_module'
import { FrontEndRoutes } from '@/types/const_routes'

export const userModule = defineStore(ModuleName.User, {
	state: () => ({
		authenticated: false,
		admin: false,
		email: '',
	}),

	actions: {

		set_authenticated (b: boolean): void {
			mealStorage.delete()
			mealViewModule().$reset()
			mealModule().$reset()
			this.authenticated = b
		},

		set_admin (b: boolean): void {
			this.admin = b
		},

		set_email (s: string): void {
			this.email = s
		},

		clear_email_admin () {
			this.email = ''
			this.admin = false
		},

		clientSideSignout (): void {
			loadingModule().set_loading(true)
			axios_authenticatedUser.signout_post()
			this.authenticated = false
			adminModule().$reset()
			snackbarModule().$reset()
			drawerModule().$reset()
			resetPasswordModule().$reset()
			this.clear_email_admin()
			infobarModule().$reset()
			mealViewModule().$reset()
			mealModule().$reset()
			mealStorage.delete()
			router.push(FrontEndRoutes.BASE)
			loadingModule().set_loading(false)
		},
	},

	persist: {
		storage: localStorage,
		pick: ['authenticated'],
	},

})
