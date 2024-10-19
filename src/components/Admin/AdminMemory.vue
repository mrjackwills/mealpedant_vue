<template>
	<v-row justify='center' class='my-0'>
		<v-col cols='12' sm='8' md='6' class='mt-8'>
			<section v-if='memory'>
				<div v-for='(index, item) in memory' :key='index' >
					<v-row
						align='center'
						justify='space-around'
						class='my-0'
					>
						<v-col cols='4' class='pa-0 text-right'>
							{{ item }}:
						</v-col>
						
						<v-col cols='4' class='pa-0 text-left' v-if='!item.includes("uptime")'>
							{{ bytes_to_mb(Number(index)) }} mb
						</v-col>
						<v-col cols='4' class='pa-0 text-left' v-else>
							{{ secondsToText(Number(index)) }}
						</v-col>
						<v-col cols='12' sm='6' class='ma-0 pa-0'>
							<v-divider />
						</v-col>
					</v-row>
				</div>
				<v-row justify='center' class='mt-2'>
					<v-col cols='auto'>
						<v-row v-for='(item, index) in buttonArray'
							:class='{"mt-4" : index === 1}'
							:key='index'
							align='center'
							class='no-gutters'
							justify='center'
						>
							<v-col cols='12' md='auto' class='pa-0'>
								<v-btn
									@click='clicker'
									:block='smAndDown'
									:color='item.color'
									min-width='25vw'
									size='large'
									variant='flat'
								>
									<ButtonIcon
										:icon='item.icon'
										color='white'
										small
									/>
									<span class='white--text'>{{ item.text }}</span>
								</v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</section>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { bytes_to_mb } from '@/vanillaTS/bytes_to_mb';
import { dialoger } from '@/services/dialog';
import { mdiRestartAlert } from '@mdi/js';
import { secondsToText } from '@/vanillaTS/secondsToText';
import { snackSuccess } from '@/services/snack';
import { useDisplay } from 'vuetify';
import type { TAuthObject, TServerStats, u } from '@/types';
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
const memory = computed((): u<TServerStats> => {
	return adminModule().memory;
});
	
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

/**
** Clear all timers
*/
const clearTimeouts = (): void => {
	clearTimeout(disabledTimeout.value);
	clearInterval(secondsInterval.value);
	clearTimeout(pageTimeout.value);
};
/**
** Execute named method, used in v-for iterations
* @param {string} method Valid method name in this component
*/
const clicker = (): void => {
	restartDialog();
};

/**
 ** Open dialog, and start countdown timer for confirm button
*/
const restartDialog = async (): Promise<void> => {
	dialoger({
		message: 'Are you sure you want to restart the server?',
		buttonText: 'restart',
		title: 'Restart Server',
		passwordRequired: true,
		confirmFunction: restartServer

	});
};
/**
** Send axios request to restart app, if no error, refresh memory stats with snack
* @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
*/
const restartServer = async (authObject: TAuthObject): Promise<void> => {
	loading.value = true;
	snackSuccess({ message: `Restarting server`, loading: true, type: 'info', timeout: 4000 });
	pageTimeout.value = window.setTimeout(() => axios_admin.memory_get(), 5000);
	await axios_admin.restart_put(authObject);
	loading.value = false;
};
</script>