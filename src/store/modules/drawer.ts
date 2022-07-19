import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';

export const drawerModule = defineStore(ModuleName.Drawer, {

	state: () => ({
		disabled: false,
		mini: false,
		open: false,
	}),

	actions: {
		set_disabled (x: boolean) {
			this.disabled = x;
		},

		set_mini (x: boolean) {
			this.mini = x;
		},

		set_open (x: boolean) {
			if (!this.disabled) this.open = x;
		}
	}
});
