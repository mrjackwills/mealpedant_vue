/* eslint-disable unicorn/no-this-outside-of-class */
import { defineStore } from 'pinia'
import { ModuleName } from '@/types/const_module'

export const loadingModule = defineStore(ModuleName.Loading, {

	state: () => ({ loading: false }),

	actions: {
		set_loading (value: boolean) {
			this.loading = value
		},
	},
})
