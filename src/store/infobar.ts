import { defineStore } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { TInfobarmessage } from '@/types';

export const infobarModule = defineStore(ModuleName.Infobar, {
	state: () => ({ messages: [] as Array<TInfobarmessage> }),

	actions: {
		add_message (x: TInfobarmessage) {
			const messageIndex = this.messages.findIndex((i) => i.message === x.message);
			if (messageIndex >= 0) return;
			this.messages.push(x);
		},

		remove_message (x: string) {
			const messageIndex = this.messages.findIndex((i) => i.message === x);
			if (messageIndex < 0) return;
			this.messages.splice(messageIndex, 1);
		}

	}
});