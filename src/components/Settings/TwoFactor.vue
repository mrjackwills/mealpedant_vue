<template>
	<section>
		<v-row justify='start' class='ma-0 pa-0'>
			<v-col cols='auto' class='ma-0 pa-0' :class='{"ml-8": $vuetify.breakpoint.mdAndUp}'>
				<div class='' :class='headingSize'>Two Factor Authentication</div>
			</v-col>
		</v-row>
		<app-status-row
			@click='removeTwoFA'
			v-if='active'
			:active='active'
			text='Two-Factor enabled'
		/>
		<app-inactive v-if='!active' />
		<template v-else>
			<app-status-row
				@click='removeBackups'
				:active='backup_count > 0'
				:text='backupText'
			/>
			<app-backup />
			<app-always-required />
		</template>
		
	</section>
</template>

<script lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { loadingModule, twoFAModule } from '@/store';
import { mapStores } from 'pinia';
import { snackSuccess } from '@/services/snack';
import { TAuthObject } from '@/types';
import AlwaysRequired from '@/components/Settings/TwoFA/AlwaysRequired.vue';
import Backup from '@/components/Settings/TwoFA/Backup.vue';
import StatusRow from '@/components/Settings/TwoFA/StatusRow.vue';
import TwoFAInactive from '@/components/Settings/TwoFA/Inactive.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'two-fa-status',

	async beforeDestroy () {
		const promiseList = [
			this.twoFAStore.set_secret(undefined),
			this.twoFAStore.set_setupProcessStarted(false),
			this.twoFAStore.set_backupProcess(false),
		];
		await Promise.all(promiseList);
		if (this.setupProcessStarted) await axios_authenticatedUser.setupTwoFA_delete();
	},

	components: {
		appAlwaysRequired: AlwaysRequired,
		appBackup: Backup,
		appInactive: TwoFAInactive,
		appStatusRow: StatusRow,
	},

	computed: {
		...mapStores(twoFAModule),

		active (): boolean {
			return this.twoFAStore.active;
		},
		backupText (): string {
			return this.backup_count > 0 ? `Backups enabled - ${this.backup_count} remaining` : 'Backup tokens not enabled';
		},
		backup_count (): number {
			return this.twoFAStore.backup_count;
		},
		headingSize (): string {
			return this.$vuetify.breakpoint.mdAndDown? 'text-h5':'text-h4';
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		setupProcessStarted (): boolean {
			return this.twoFAStore.setupProcessStarted;
		}
	},

	methods: {
		/**
		 * @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
		 */
		async removeTwoFAFunction (authObject: TAuthObject): Promise<void> {
			this.loading = true;
			const confirm = await axios_authenticatedUser.twoFA_delete(authObject);
			if (confirm) {
				this.twoFAStore.set_backupProcess(false);
				snackSuccess({ message: 'Two-Factor Authentication removed' });
			}
			this.loading = false;
		},
		async removeTwoFABackupFunction (authObject: TAuthObject): Promise<void> {
			this.loading = true;
			const success = await axios_authenticatedUser.twoFA_put(authObject);
			if (success) this.twoFAStore.set_backupProcess(false);
			this.loading = false;
		},
		removeBackups (): void {

			dialoger({
				message: 'Are you sure you want to remove all of your Two-Factor Authentication back up codes?',
				buttonText: 'disable',
				title: 'Remove Backup Codes',
				passwordRequired: true,
				confirmFunction: this.removeTwoFABackupFunction
			});
		},
		removeTwoFA (): void {
			let message = 'Are you sure you want to reduce the safety and security of your account by disabling Two-Factor Authentication?';
			message += this.backup_count > 0 ? ' This will also remove all of your backup tokens' : '';

			dialoger({
				message,
				buttonText: 'remove',
				title: 'Disable Two-Factor Authentication',
				passwordRequired: true,
				confirmFunction: this.removeTwoFAFunction
			});

		}
	},
});
</script>
