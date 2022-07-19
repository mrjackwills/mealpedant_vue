import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import { su, TConfirmFunction, u, TDialogTitle, TButtonText } from '@/types';

export const dialogModule = defineStore(ModuleName.Dialog, {

	state: () => ({
		confirmButton: undefined as u<TButtonText>,
		confirmFunction: undefined as u<TConfirmFunction>,
		icon: undefined as su,
		message: undefined as su,
		passwordRequired: false,
		timeout: 0,
		title: undefined as u<TDialogTitle>,
		visible: false,
	}),

	actions: {
		set_confirmButton (x: u<TButtonText>) {
			this.confirmButton = x;
		},
		
		set_confirmFunction (x: u<TConfirmFunction>) {
			this.confirmFunction = x;
		},
		
		set_icon (x: su) {
			this.icon = x;
		},
		
		set_message (x: su) {
			this.message = x;
		},
		
		set_passwordRequired (x: boolean) {
			this.passwordRequired = x;
		},
		
		set_timeout (x: number) {
			this.timeout = x;
		},
		
		set_title (x: u<TDialogTitle>) {
			this.title = x;
		},
		
		set_visible (x: boolean) {
			this.visible = x;
		},
	}

});
