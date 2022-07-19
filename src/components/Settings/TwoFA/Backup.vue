<template>
	<section>
		<v-row align='center' justify='center' class='ma-0 pa-0' v-if='!backup'>
			<v-col cols='12' md='8' class='pa-0 mb-4'>
				Backups enable a user to login to their account in situations where their two factor authentcation app is unavailable.
				Each backup code can only be used once, and must be safely stored by the user.
				<br>
				<br>
				All backup tokens are salted and hashed before being written to the databse. This means that lost backup tokens cannot be retreived by Meal Pedant.
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
								:small='backup'
								color='secondary'
							>
								<v-icon> {{ backupButtonIcon }} </v-icon>
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
							<v-simple-table>
								<template v-slot:default>
									<tbody>
										<tr v-for='(item, index) in backupArray.slice(0,5)' :key='index'>
											<td class=''>
												<v-row class='ma-0 pa-0' dense no-gutters>
													<v-col class='pa-0 ma-0' :class='{"smalltext" : $vuetify.breakpoint.smAndDown}'>
														{{ item }}
													</v-col>
												</v-row>
											</td>
											<td class=''>
												<v-row class='ma-0 pa-0' dense no-gutters>
													<v-col class='pa-0 ma-0 text-right' :class='{"smalltext" : $vuetify.breakpoint.smAndDown}'>
														{{ backupArray[index+5] }}
													</v-col>
												</v-row>
											</td>
										</tr>
									</tbody>
								</template>
							</v-simple-table>
							<v-row
								justify='space-around'
								align='center'
								dense
								no-gutters
								class='mt-4'
							>
								
								<v-col cols='12' class='ma-0 pa-0'>
									<v-tooltip attach='#tooltip' top v-model='showTooltip'>
										<template v-slot:activator='{ on }' >
											<div v-on='on' ></div>
										</template>
										<span>copied to clipboard</span>
									</v-tooltip>
								</v-col>
								<v-col cols='auto'>
									<v-btn
										@click='close'
										color='error'
									>
										<v-icon>{{ mdiClose }}</v-icon>
										close
									</v-btn>
								</v-col>
								<v-col cols='auto' class='mx-2' :class='{"my-2" : $vuetify.breakpoint.smAndDown}'>
									<v-btn
										@click='downloadCodes'
										color='primary'
										:dark='true'
										class='black--text'
									>
										<v-icon color='black'>{{ mdiDownload }}</v-icon>
										download
									</v-btn>

								</v-col>
								<v-col cols='auto' id='tooltip'>
									<v-btn
										@click='copyCodes'
										color='secondary'
									>
										<v-icon>{{ mdiContentCopy }}</v-icon>
										copy all
									</v-btn>

								</v-col>
							</v-row>
						</v-col>
					</v-row>
				</section>
			</section>
		</v-expand-transition>
	</section>
</template>

<script lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { loadingModule, twoFAModule } from '@/store';
import { mdiClose, mdiContentCopy, mdiDownload, mdiShieldKey, mdiShieldRefresh } from '@mdi/js';
import { TAuthObject } from '@/types';
import copy from 'clipboard-copy';
import Vue from 'vue';

export default Vue.extend({
	name: 'two-fa-inactive',

	beforeDestroy () {
		clearTimeout(this.TooltipTimeout);
	},
	
	computed: {
		backup (): boolean {
			return twoFAModule().backup_count > 0;
		},
		backupButtonIcon (): string {
			return this.backup ? mdiShieldRefresh : mdiShieldKey;
		},
		backupButtonText (): string {
			return this.backup ? 'refresh backup tokens' : 'generate backup tokens';
		},
		backupProcess: {
			get (): boolean {
				return twoFAModule().backupProcess;
			},
			set (b: boolean): void {
				twoFAModule().set_backupProcess(b);
			}
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
	
	data: () => ({
		backupArray: [] as Array<string>,
		localLoading: false,
		mdiClose,
		mdiContentCopy,
		mdiDownload,
		showTooltip: false,
		TooltipTimeout: 0,
	}),

	methods: {
		backupCodes (): string {
			if (!this.backupArray) return '';
			let output = `Meal Pedant Two-Factor backup tokens\nStore these somewhere secure\n`;
			for (const [ index, item ] of Object.entries(this.backupArray)) {
				if (Number(index) +1 === this.backupArray.length) output += `\n${item}`;
				else output += `\n${item}\n`;
			}
			return output;
		},
		close (): void {
			this.backupArray = [];
			twoFAModule().set_backupProcess(false);
		},
		/**
		 ** Copy the 2fa codes, create multi-line string with description as first line
		 */
		copyCodes (): void {
			copy(this.backupCodes());
			this.showTooltip = true;
			this.TooltipTimeout = setTimeout(() => {
				this.showTooltip = false;
			}, 1750);
		},
		/**
		 ** Download the 2fa codes as .txt, all clientside, create multi-line string with description as first line
		 */
		downloadCodes (): void {
			const downloadCodes = document.createElement('a');
			downloadCodes.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.backupCodes()));
			downloadCodes.setAttribute('download', 'Meal_Pedant_2FA_backup_tokens.txt');
			downloadCodes.style.display = 'none';
			document.body.appendChild(downloadCodes);
			downloadCodes.click();
			document.body.removeChild(downloadCodes);
		},
		/**
		 ** Generate button - dialog warning overwrite if backups already exist, else just generate
		 */
		async buttonPress (): Promise<void> {
			if (this.backup) {
				dialoger({
					message: 'Refreshing will revoke all currently active backup tokens, do you wish to continue?',
					buttonText: 'refresh',
					title: 'Confirm',
					passwordRequired: true,
					confirmFunction: this.generateBackups
				});
			
			} else {
				this.generateBackups();
			}
		},
		/**
		 ** Post request to generate new backup tokens
		 */
		async generateBackups (authObject?: TAuthObject): Promise<void> {
			// TODO throw here if no auth object?
			this.loading = true;
			this.localLoading = true;
			// this could be refactored to a single line
			twoFAModule().set_backupProcess(true);
			if (this.backup && authObject) {
				const response = await axios_authenticatedUser.twoFA_patch(authObject);
				if (response) this.backupArray = response;
			}
			else if (!this.backup) {
				const backups = await axios_authenticatedUser.twoFA_post();
				if (backups) this.backupArray = backups;
			}
			this.loading = false;
			this.localLoading = false;
		}
	},
});
</script>