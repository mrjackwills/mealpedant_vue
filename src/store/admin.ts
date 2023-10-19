import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import type { u, TServerStats, TBackup, TLimit, TAllUserInfo, TLogs } from '@/types';

export const adminModule = defineStore(ModuleName.Admin, {

	state: () => ({
		backup: [] as TBackup,
		email: [] as Array<string>,
		limit: [] as TLimit,
		logs: [] as Array<TLogs>,
		memory: undefined as u<TServerStats>,
		registeredUsers: [] as TAllUserInfo,
		date: '',
		person: '',
	}),

	actions: {
		set_date (x: string) {
			this.date = x;
		},

		set_person (x: string) {
			this.person = x;
		},

		set_email (b: Array<string>) {
			this.email =b;
		},
			
		set_logs (b: Array<TLogs>) {
			this.logs = b;
		},
			
		set_backup (b: TBackup) {
			this.backup = b;
		},
			
		set_limit (b: TLimit) {
			this.limit = b;
		},
			
		set_memory (b: TServerStats) {
			this.memory = b;
		},
			
		set_registeredUsers (b: TAllUserInfo) {
			this.registeredUsers = b;
		}
	}
});