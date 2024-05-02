<template>
	<section>
		<v-row align='center' justify='center' class='ma-0 pa-0' v-if='!backup'>
			<v-col cols='12' md='8' class='pa-0 mb-4'>
				Backups enable a user to login to their account in situations where their two factor authentcation app is unavailable.
				Each backup code can only be used once, and must be safely stored by the user.
				<br>
				<br>
				All backup tokens are salted and hashed before being written to the database. This means that lost backup tokens cannot be retrieved by Meal Pedant.
			</v-col>
		</v-row>
		<v-expand-transition>
			<v-row
				v-if='backupArray.length === 0'
				align='center'
				justify='center'
				class='ma-0 pa-0'
			>
				<v-col
					class='ma-0 pa-0'
					cols='12'
					lg='4'
				>
					<v-row justify='center'>
						<v-col cols='auto'>
							<v-btn
								@click='buttonPress'
								:disabled='localLoading'
								color='secondary'
								variant='flat'
							>
								<v-icon :icon='backupButtonIcon' />
								{{ backupButtonText }}
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-expand-transition>
		<v-expand-transition>
			<section v-if='backupArray.length > 0'>
				<section>
					<v-row align='center' justify='center' class='ma-0 pa-0'>

						<v-col cols='auto' class='ma-0 pa-0 pi--text'>
							These backup tokens need to be stored securely, each token can only be used once
						</v-col>

					</v-row>
					<v-row
						justify='center'
						align='center'
						dense
						no-gutters
						class='mt-4'
					>
						<v-col cols='12' md='auto' class='ma-0 pa-0'>
							<v-row class='ma-0 pa-0' justify='space-between'>
								<v-col cols='5'>
									<div v-for='(item, index) in backupArray.slice(0,5)' :key='index'>
										{{ item }}
									</div>
								</v-col>
								<v-col cols='5'>
									<div v-for='(item, index) in backupArray.slice(5,10)' :key='index'>
										{{ item }}
									</div>
										
								</v-col>
							</v-row>
						</v-col>
					</v-row>
					<v-row
						justify='space-around'
						align='center'
						dense
						no-gutters
						class='mt-4'
					>
								
						<v-col cols='12' class='ma-0 pa-0'>

						</v-col>
						<v-col cols='auto'>
							<v-btn
								@click='close'
								color='error'
								variant='flat'
							>
								<v-icon :icon='mdiClose' />
								close
							</v-btn>
						</v-col>
						<v-col cols='auto' class='mx-2' :class='{"my-2" : smAndDown}'>
							<v-btn
								@click='downloadCodes'
								color='primary'
								:dark='true'
								variant='flat'
								class='black--text'
							>
								<v-icon color='black' :icon='mdiDownload' />
								download
							</v-btn>

						</v-col>
						<v-col cols='auto' id='tooltip'>
							<v-btn
								@click='copyCodes'
								color='secondary'
								variant='flat'
							>
								<v-icon :icon='mdiContentCopy' />
								copy all
							</v-btn>
							<v-tooltip v-if='showTooltip' :open-on-click='true' :open-on-hover='false' activator='parent' location='top center' content-class='tooltip'>
								<span>copied to clipboard</span>
							</v-tooltip>

						</v-col>
					</v-row>
				</section>
			</section>
		</v-expand-transition>
	</section>
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { mdiClose, mdiContentCopy, mdiDownload, mdiShieldKey, mdiShieldRefresh } from '@mdi/js';
import type { TAuthObject } from '@/types';
import { useClipboard } from '@vueuse/core';
import { useDisplay } from 'vuetify';
const { smAndDown } = useDisplay();

onBeforeUnmount(() => {
	clearTimeout(tooltipTimeout.value);

});
	
const backup = computed((): boolean => {
	return twoFAModule().backup_count > 0;
});
const backupButtonIcon = computed((): string => {
	return backup.value ? mdiShieldRefresh : mdiShieldKey;
});
const backupButtonText = computed((): string => {
	return backup.value ? 'refresh backup tokens' : 'generate backup tokens';
});
const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
	
const backupArray = ref([] as Array<string>);
const localLoading = ref(false);
const showTooltip = ref(false);
const tooltipTimeout = ref(0);

const backupCodes = (): string => {
	if (!backupArray.value) return '';
	let output = `Meal Pedant Two-Factor backup tokens\nStore these somewhere secure\n`;
	for (const [ index, item ] of Object.entries(backupArray.value)) {
		if (Number(index) +1 === backupArray.value.length) output += `\n${item}`;
		else output += `\n${item}\n`;
	}
	return output;
};
const close = (): void => {
	backupArray.value = [];
	twoFAModule().set_backupProcess(false);
};
/**
** Copy the 2fa codes, create multi-line string with description as first line
*/
const copyCodes = (): void => {
	useClipboard().copy(backupCodes());
	showTooltip.value = true;
	tooltipTimeout.value = window.setTimeout(() => {
		showTooltip.value = false;
	}, 1750);
};
/**
** Download the 2fa codes as .txt, all clientside, create multi-line string with description as first line
*/
const downloadCodes = (): void => {
	const downloadCodes = document.createElement('a');
	downloadCodes.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(backupCodes()));
	downloadCodes.setAttribute('download', 'Meal_Pedant_2FA_backup_tokens.txt');
	downloadCodes.style.display = 'none';
	document.body.appendChild(downloadCodes);
	downloadCodes.click();
	document.body.removeChild(downloadCodes);
} ;
/**
** Generate button - dialog warning overwrite if backups already exist, else just generate
*/
const buttonPress = async (): Promise<void> => {
	if (backup.value) {
		dialoger({
			message: 'Refreshing will revoke all currently active backup tokens, do you wish to continue?',
			buttonText: 'refresh',
			title: 'Confirm',
			passwordRequired: true,
			confirmFunction: generateBackups
		});
			
	} else {
		generateBackups();
	}
};
/**
** Post request to generate new backup tokens
*/
const generateBackups = async (authObject?: TAuthObject): Promise<void> => {
	// TODO throw here if no auth object?
	loading.value = true;
	localLoading.value = true;
	// this could be refactored to a single line
	twoFAModule().set_backupProcess(true);
	if (backup.value && authObject) {
		const response = await axios_authenticatedUser.twoFA_patch(authObject);
		if (response) backupArray.value = response;
	}
	else if (!backup.value) {
		const backups = await axios_authenticatedUser.twoFA_post();
		if (backups) backupArray.value = backups;
	}
	loading.value = false;
	localLoading.value = false;
	await axios_authenticatedUser.authenticated_get();
};
</script>