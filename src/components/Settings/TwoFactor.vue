<template>
	<v-row justify='start' class='ma-0 pa-0'>
		<v-col cols='auto' class='ma-0 pa-0' :class='{"ml-8": mdAndUp}'>
			<div class='' :class='headingSize'>Two Factor Authentication</div>
		</v-col>
	</v-row>
	<TFAStatusRow
		@click='removeTwoFA'
		v-if='active && !backupProcess'
		:active='active'
		text='Two-Factor enabled'
	/>
	<TFAInactive v-if='!active' />
	<section v-else>
		<TFAStatusRow
			v-if='!backupProcess'
			@click='removeBackups'
			:active='backup_count > 0'
			:text='backupText'
		/>
		<TFABackup />
		<TFAAlwaysRequired />
	</section>
		
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { snackSuccess } from '@/services/snack';
import type { TAuthObject } from '@/types';
import { useDisplay } from 'vuetify';
const { mdAndDown, mdAndUp } = useDisplay();

const twoFAStore = twoFAModule();

onBeforeMount(async () => {
	const promiseList = [
		twoFAStore.set_secret(undefined),
		twoFAStore.set_setupProcessStarted(false),
		twoFAStore.set_backupProcess(false)
	];
	await Promise.all(promiseList);
	if (setupProcessStarted.value) await axios_authenticatedUser.setupTwoFA_delete();
});

const active = computed((): boolean => {
	return twoFAStore.active;
});
const backupText = computed((): string => {
	return backup_count.value > 0 ? `Backups enabled - ${backup_count.value} remaining` : 'Backup tokens not enabled';
});
const backup_count = computed((): number => {
	return twoFAStore.backup_count;
});

const backupProcess = computed((): boolean => {
	return twoFAStore.backupProcess;
});
const headingSize = computed((): string => {
	return mdAndDown.value ? 'text-h5' : 'text-h4';
});
const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const setupProcessStarted = computed((): boolean => {
	return twoFAStore.setupProcessStarted;
});

/**
* @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
*/
const removeTwoFAFunction = async (authObject: TAuthObject): Promise<void> => {
	loading.value = true;
	const confirm = await axios_authenticatedUser.twoFA_delete(authObject);
	if (confirm) {
		twoFAStore.set_backupProcess(false);
		snackSuccess({ message: 'Two-Factor Authentication removed' });
	}
	loading.value = false;
};
const removeTwoFABackupFunction = async (authObject: TAuthObject): Promise<void> => {
	loading.value = true;
	const success = await axios_authenticatedUser.twoFA_put(authObject);
	if (success) twoFAStore.set_backupProcess(false);
	snackSuccess({ message: 'Two-Factor Authentication backups removed' });
	loading.value = false;
};
const removeBackups = (): void => {

	dialoger({
		message: 'Are you sure you want to remove all of your Two-Factor Authentication back up codes?',
		buttonText: 'disable',
		title: 'Remove Backup Codes',
		passwordRequired: true,
		confirmFunction: removeTwoFABackupFunction
	});
};
const removeTwoFA = (): void => {
	let message = 'Are you sure you want to reduce the safety and security of your account by disabling Two-Factor Authentication?';
	message += backup_count.value > 0 ? ' This will also remove all of your backup tokens' : '';

	dialoger({
		message,
		buttonText: 'remove',
		title: 'Disable Two-Factor Authentication',
		passwordRequired: true,
		confirmFunction: removeTwoFAFunction
	});

};
</script>
