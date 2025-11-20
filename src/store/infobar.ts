import type { TInfobarmessage } from '@/types'
import { defineStore } from 'pinia'
import { ModuleName } from '@/types/const_module'

export const infobarModule = defineStore(ModuleName.Infobar, {
	state: () => ({ messages: [] as Array<TInfobarmessage> }),

	actions: {
		add_message (x: TInfobarmessage) {
			const messageIndex = this.messages.findIndex(i => i.message === x.message)
			if (messageIndex !== -1) {
				return
			}
			this.messages.push(x)
		},

		remove_message (x: string) {
			const messageIndex = this.messages.findIndex(i => i.message === x)
			if (messageIndex === -1) {
				return
			}
			this.messages.splice(messageIndex, 1)
		},
	},
})
