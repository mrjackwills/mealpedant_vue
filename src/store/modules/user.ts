import { adminModule, categoriesModule, drawerModule, foodModule, infobarModule, loadingModule, mealsModule, resetPasswordModule, snackbarModule } from '@/store';
import { defineStore } from 'pinia';
import { dexieDB } from '@/services/dexieDB';
import { localStorageKeyName } from '@/vanillaTS/globalConsts';
import { ModuleName } from '@/types/enum_module';
import { router } from '@/router';

export const userModule = defineStore(ModuleName.User, {
	state: ()=> ({
		authenticated: useStorage(localStorageKeyName, false),
		admin: false,
		email: ''
	}),

	
	persist: {
		storage: localStorage,
		paths: [ 'authenticated' ],
	  },

	actions: {

		set_authenticated (b: boolean): void {
			this.authenticated = b;
		},
			
		set_admin (b: boolean): void {
			this.admin = b;
		},

		set_email (s: string): void {
			this.email = s;
		},

		clear_email_admin () {
			this.email = '';
			this.admin = false;
		},
		
		async clientSideSignout (): Promise<void> {
			snackbarModule().$reset();
			this.clear_email_admin();
			this.authenticated = false;
			if (router.currentRoute.path !== '/') router.push('/');
			await dexieDB.clear_all();
			loadingModule().set_loading(false);
			await Promise.all([
				adminModule().$reset(),
				drawerModule().$reset(),
				resetPasswordModule().$reset(),
				infobarModule().$reset(),
				categoriesModule().$reset(),
				foodModule().$reset(),
				mealsModule().$reset()
			]);
		}
	}

});