import { defineStore } from 'pinia';
import { dexieDB } from '@/services/dexieDb';
import { ModuleName } from '@/types/enum_module';
import { getActivePinia } from 'pinia';

export const userModule = defineStore(ModuleName.User, {
	state: ()=> ({
		authenticated: false,
		admin: false,
		email: ''
	}),
	
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
			getActivePinia()?.router().push('/');
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
	},
	
	persist: {
		storage: localStorage,
		pick: [ 'authenticated' ],
	},

});