<template>
	<section class='mt-5' v-if='!backupProcess'>
		<v-row class='ma-0 pa-0' align='center' justify='center'>
			<v-col cols='12' md='8' class='ma-0 pa-0'>
				<v-row class='ma-0 pa-0' align='center' justify='center'>
					<v-col cols='auto' class='ma-0 pa-0' @click='toggle'>
						<v-switch
							v-model='arVal'
							:disabled='backupProcess'
							class='ma-0 pa-0'
							label=''
							color='primary'
							density='compact'
						>
							<template v-slot:label>
								<span class=''>Extra Two-Factor Authentication prompts</span>
							</template>
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

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { mdiDeleteCircle } from '@mdi/js';
import { snackSuccess } from '@/services/snack';
import type { TAuthObject } from '@/types';

const arVal = ref(false);

onMounted(() => {
	arVal.value = always_required.value;
});

const always_required = computed({
	get (): boolean {
		return twoFAModule().alwaysRequired;
	},
	set (b: boolean): void {
		twoFAModule().set_alwaysRequired(b);
	}

});

watch(always_required, (_) => {
	arVal.value = always_required.value;
});

watch(arVal, (_) => {
	arVal.value = always_required.value;
});

const backupProcess = computed((): boolean => {
	return twoFAModule().backupProcess;
});
const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const confirm_function = async (authObject: TAuthObject): Promise<void> => {
	loading.value = true;
	const success = await axios_authenticatedUser.setupTwoFA_patch({
		...authObject,
		always_required: false 
	});
	if (success) snackSuccess({
		message: 'Extra Two Factor Authentication prompts removed',
		icon: mdiDeleteCircle 
	});
	loading.value = false;
};

const show_dialog = (): void => {

	dialoger({
		message: 'Are you sure you want to remove the extra Two Factor Authentication prompts?',
		buttonText: 'confirm',
		title: 'Confirm',
		passwordRequired: true,
		confirmFunction: confirm_function
	});
};
const toggle = async (): Promise<void> => {
	if (!always_required.value) {
		loading.value = true;
		const success = await axios_authenticatedUser.setupTwoFA_patch({ always_required: true });
		if (success) snackSuccess({ message: 'Extra Two Factor Authentication prompts enabled' });
		loading.value = false;

	} else {
		show_dialog();
	}
};
</script>