<template>
	<section class='mt-5' v-if='!backupProcess'>
		<v-row class='ma-0 pa-0' align='center' justify='center'>
			<v-col cols='12' md='8' class='ma-0 pa-0'>
				<v-row class='ma-0 pa-0' align='center' justify='center'>
					<v-col cols='auto' class='ma-0 pa-0' @click='toggle'>
						<v-switch
							v-model='always_required'
							:disabled='backupProcess'
							class='ma-0 pa-0'
							label=''
							dense
							readonly
						>
							<span slot='label' class=''>Extra Two-Factor Authentication prompts</span>
						</v-switch>
					</v-col>
				</v-row>
				<v-row class='ma-0 pa-0 mt-n4' align='center' justify='center'>
					<v-col cols='12' class='ma-0 pa-0'>
						When enabled, a Two Factor Authentication token will be required at all password prompts. Otherwise, a Two Factor Authentication token will only be required at login.
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</section>
</template>

<script lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { loadingModule, twoFAModule } from '@/store';
import { mdiDeleteCircle } from '@mdi/js';
import { snackSuccess } from '@/services/snack';
import { TAuthObject } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'always-required-row-component',

	computed: {
		always_required: {
			get (): boolean {
				return twoFAModule().alwaysRequired;
			},
			set (b: boolean): void {
				twoFAModule().set_alwaysRequired(b);
			}
		},
		backupProcess (): boolean {
			return twoFAModule().backupProcess;
		},
		loading: {
			get (): boolean {
				return loadingModule().loading;
			},
			set (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
	},

	methods: {
		async confirm_function (authObject: TAuthObject): Promise<void> {
			this.loading = true;
			const success = await axios_authenticatedUser.setupTwoFA_patch({ ...authObject, always_required: false });
			if (success) snackSuccess({ message: 'Extra Two Factor Authentication prompts removed', icon: mdiDeleteCircle });
			this.loading = false;
		},

		show_dialog ():void {

			dialoger({
				message: 'Are you sure you want to remove the extra Two Factor Authentication prompts?',
				buttonText: 'confirm',
				title: 'Confirm',
				passwordRequired: true,
				confirmFunction: this.confirm_function
			});
		},
		async toggle (): Promise<void> {
			if (!this.always_required) {
				this.loading = true;
				const success = await axios_authenticatedUser.setupTwoFA_patch({ always_required: true });
				if (success) snackSuccess({ message: 'Extra Two Factor Authentication prompts enabled' });
				this.loading = false;

			} else {
				this.show_dialog();
			}
		}
	},
});
</script>