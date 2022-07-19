import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import { su, nu, TSnackPosition } from '@/types';

export const snackbarModule = defineStore(ModuleName.Snack, {

	state: () => ({
		closable: false,
		color: undefined as su,
		icon: undefined as su,
		loading: false,
		message: undefined as su,
		position: { x: undefined, y: undefined } as TSnackPosition,
		timeout: undefined as nu,
		visible: false,
	}),

	actions: {
	
		set_closable (x: boolean) : void {
			this.closable = x;
		},
	
		set_color (x: su) : void {
			this.color = x;
		},
	
		set_icon (x: su): void {
			this.icon = x;
		},
	
		set_loading (x: boolean) : void {
			this.loading = x;
		},
	
		set_message (x: su): void {
			this.message = x;
		},
	
		set_position (x: TSnackPosition) : void {
			this.position = x;
		},
	
		set_timeout (x: nu): void {
			this.timeout = x;
		},
	
		set_visible (x: boolean) : void {
			this.visible = x;
		},
	}
});