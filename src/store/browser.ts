import { defineStore } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { su } from '@/types';

export const browserModule = defineStore(ModuleName.Browser, {

	state: () => ({
		api_version: undefined as su,
		description: '',
		init: false,
		online: true,
		pageTitle: '',
		pwa: false
	}),

	actions: {
		
		set_api_version (x: su) {
			this.api_version = x;
		},

		set_description (x: string) {
			this.description = x;
		},
	
		set_init (x: boolean) {
			this.init = x;
		},
	
		set_online (x: boolean) {
			this.online = x;
		},
	
		set_pageTitle (x: string) {
			this.pageTitle = x;
		},

		set_pwa (x: boolean) {
			this.pwa = x;
		}
	}

});
