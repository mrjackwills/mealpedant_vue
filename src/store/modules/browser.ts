import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import { su } from '@/types';

export const browserModule = defineStore(ModuleName.Browser, {

	state: () => ({
		api_version: undefined as su,
		init: false,
		online: true,
		pwa: false,
	}),

	actions: {
		
		set_api_version (x: su) {
			this.api_version = x;
		},
	
		set_init (x: boolean) {
			this.init = x;
		},
	
		set_online (x: boolean) {
			this.online = x;
		},
	
		set_pwa (x: boolean) {
			this.pwa = x;
		}
	}

});
