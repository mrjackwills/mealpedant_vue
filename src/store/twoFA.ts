import { defineStore } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { su } from '@/types';

export const twoFAModule = defineStore(ModuleName.TwoFa, {

	state: () => ({
		active: false,
		alwaysRequired: false,
		backupProcess: false,
		backup_count: 0,
		secret: undefined as su,
		setupProcessStarted: false
	}),

	actions: {
		
		set_active (x: boolean) {
			this.active = x;
		},
	
		set_alwaysRequired (x: boolean) {
			this.alwaysRequired = x;
		},
	
		set_backupProcess (x: boolean) {
			this.backupProcess = x;
		},
	
		set_backup_count (x: number) {
			this.backup_count = x;
		},
	
		set_secret (x: su) {
			this.secret = x;
		},
	
		set_setupProcessStarted (x: boolean) {
			this.setupProcessStarted = x;
		}
	}
});
