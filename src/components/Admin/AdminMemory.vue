<template>
	<v-row justify='center' class='my-0'>
		<v-col cols='12' sm='8' md='6' class='mt-8' v-if='memory'>
			<v-row v-for='(value, name) in memory' :key='name' align='center' justify='space-around' class='my-0'>
				<v-col cols='4' class='pa-0 text-right'>
					{{ name }}:
				</v-col>
				<v-col cols='4' class='pa-0 text-left' v-if='!name.includes("uptime")'>
					{{ bytes_to_mb(Number(value)) }} mb
				</v-col>
				<v-col cols='4' class='pa-0 text-left' v-else>
					{{ secondsToText(Number(value)) }}
				</v-col>
				<v-col cols='12' sm='6' class='ma-0 pa-0'>
					<v-divider />
				</v-col>
			</v-row>
			<v-row justify='center' class='mt-2'>
				<v-col cols='auto'>
					<v-row v-for='(item, index) in buttonArray' :class='{ "mt-4": index === 1 }' :key='index'
						align='center' class='no-gutters' justify='center'>
						<v-col cols='12' md='auto' class='pa-0'>
							<v-btn @click='restartDialog'
								:block='smAndDown' :color='item.color' min-width='25vw'
								variant='flat'
								rounded
							>
								<ButtonIcon :icon='item.icon' color='white' small />
								<span class='text-white'>{{ item.text }}</span>
							</v-btn>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { mdiRestartAlert } from '@mdi/js';
import { bytes_to_mb, secondsToText } from '@/vanillaTS/helpers';
import { snackSuccess } from '@/services/snack';
import { useDisplay } from 'vuetify';
import type { PV, TAuthObject, TServerStats, u } from '@/types';
const { smAndDown } = useDisplay();

onBeforeUnmount(() => {
	clearTimeouts();
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const memory = computed((): u<TServerStats> => adminModule().memory);

const buttonArray = [
	{
		text: 'restart application',
		icon: mdiRestartAlert,
		color: 'error',
		click: 'restartDialog' as const
	}
];
const disabledTimeout = ref(0);
const pageTimeout = ref(0);
const secondsInterval = ref(0);

// Clear all timers
const clearTimeouts = (): void => {
	clearTimeout(disabledTimeout.value);
	clearInterval(secondsInterval.value);
	clearTimeout(pageTimeout.value);
};

// Open dialog, and start countdown timer for confirm button
const restartDialog = async (): PV => {
	dialoger({
		message: 'Are you sure you want to restart the server?',
		buttonText: 'restart',
		title: 'Restart Server',
		passwordRequired: true,
		confirmFunction: restartServer
	});
};

/*
 * Send axios request to restart app, if no error, refresh memory stats with snack
 * @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
 */
const restartServer = async (authObject: TAuthObject): PV => {
	loading.value = true;
	snackSuccess({
		message: `restarting server`,
		loading: true,
		type: 'info',
		timeout: 4000
	});
	pageTimeout.value = window.setTimeout(() => axios_admin.memory_get(), 5000);
	await axios_admin.restart_put(authObject);
	loading.value = false;
};
</script>
