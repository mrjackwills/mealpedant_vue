<template>
	<v-row justify='center' class='mt-2 my-0'>
		<v-col cols='12' sm='8' md='6' >
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
							{{ bytes_to_mb(index) }} mb
						</v-col>
						<v-col cols='4' class='pa-0 text-left' v-else>
							{{ secondsToDays(index) }}
						</v-col>
						<v-col cols='12' sm='6' class='ma-0 pa-0'>
							<v-divider />
						</v-col>
					</v-row>
				</div>
				<v-row justify='center' class='mt-2'>
					<v-col cols='12' sm='8'>
						<v-row v-for='(item, index) in buttonArray'
							:class='{"mt-4" : index === 1}'
							:key='index'
							align='center'
							class='no-gutters'
							justify='center'
						>
							<v-col cols='12' md='auto' class='pa-0'>
								<v-btn
									@click='clicker(item.click)'
									:block='$vuetify.breakpoint.smAndDown'
									:color='item.color'
									class='elevation-2'
									min-width='25vw'
									large
								>
									<app-button-icon
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

<script lang='ts'>
import { adminModule, loadingModule } from '@/store';
import { axios_admin } from '@/services/axios';
import { bytes_to_mb } from '@/vanillaTS/bytesToMb';
import { dialoger } from '@/services/dialog';
import { mdiRestartAlert } from '@mdi/js';
import { secondsToDays } from '@/vanillaTS/secondsToDays';
import { snackSuccess } from '@/services/snack';
import { TAuthObject, TServerStats, u } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'admin-memory-component',
	components: {
		appButtonIcon: ButtonIcon
	},
	async beforeDestroy () {
		this.clearTimeouts();
	},
	computed: {
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		memory (): u<TServerStats> {
			return adminModule().memory;
		}
	},
	data: () => ({
		buttonArray: [
			{
				text: 'restart appliction',
				icon: mdiRestartAlert,
				color: 'error',
				click: 'restartDialog' as const
			}
		],
		confirm: false,
		disabled: false,
		disabledTimeout: 0,
		pageTimeout: 0,
		seconds: 0,
		secondsInterval: 0,
	}),
	
	filters: {
		padding (i: string): string {
			return String(i).padStart(2, '0');
		},
		
	},
	methods: {

		bytes_to_mb (x: number): number {
			return bytes_to_mb(x);
		},
		
		secondsToDays (s: number): string {
			return secondsToDays(s);
		},
		/**
		 ** Clear all timers
		 */
		clearTimeouts (): void {
			clearTimeout(this.disabledTimeout);
			clearInterval(this.secondsInterval);
			clearTimeout(this.pageTimeout);
		},
		/**
		 ** Execute named method, used in v-for iterations
		 * @param {string} method Valid method name in this component
		 */
		clicker (): void {
			this.restartDialog();
		},
		/**
		 ** Close dialog, and clear timers
		 */
		closeDialog (): void {
			this.confirm = false;
			this.clearTimeouts();
		},
		/**
		 ** Open dialog, and start countdown timer for confirm button
		 */
		async restartDialog (): Promise<void> {

			dialoger({
				message: 'Are you sure you want to restart the server?',
				buttonText: 'restart',
				title: 'Restart Server',
				passwordRequired: true,
				confirmFunction: this.restartServer

			});
		},
		/**
		 ** Send axios request to restart app, if no error, refresh memory stats with snack
		 * @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
		 */
		async restartServer (authObject: TAuthObject): Promise<void> {
			this.loading = true;
			const success = await axios_admin.restart_put(authObject);
			if (success) {
				snackSuccess({ message: `Restarting server`, loading: true, type: 'info', timeout: 4000 });
				this.pageTimeout = setTimeout(() => axios_admin.memory_get(), 5000);
			}
			this.loading = false;
		},
	},
});
</script>