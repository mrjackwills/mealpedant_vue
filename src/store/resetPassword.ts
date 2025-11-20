import type { su } from '@/types'
import { defineStore } from 'pinia'
import { ModuleName } from '@/types/const_module'

export const resetPasswordModule = defineStore(ModuleName.ResetPassword, {

	state: () => ({
		id: undefined as su,
		two_fa_active: false,
		two_fa_backup: 0,
	}),

	actions: {
		set_id (x: su) {
			this.id = x
		},
		set_two_fa_active (x: boolean) {
			this.two_fa_active = x
		},
		set_two_fa_backup (x: number) {
			this.two_fa_backup = x
		},
	},
})
