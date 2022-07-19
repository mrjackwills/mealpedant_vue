<template>
	<v-container container--fluid fill-height>
		<v-row wrap justify='center' class='no-gutters'>
			<v-col cols='12' v-for='(item, index) in adminRows' :key='index'>
				<v-row wrap justify='center' align='center' class='no-gutters'>
					<v-col cols='12' sm='8' md='6'>
						<v-row align='center' class='no-gutters'>
							<v-col cols='12'>
								<v-row wrap v-ripple align='center' class='no-gutters' @click='clicker(item.axios,item.show)'>
									<v-col cols='auto' class='mr-2' >
										<h2 class='cl'>{{ item.title }}</h2>
									</v-col>
									<v-spacer />
									<v-col cols='auto' :class='{"ml-md-12": returnThis(item.show)}'>
										<v-icon style='vertical-align: middle;'>{{ returnThis(item.icon) }}</v-icon>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
				<v-col cols='12' class='pa-1'>
					<v-expand-transition>
						<div v-if='returnThis(item.show)'>
							<v-col cols='12' class='pa-0'>
								<v-row justify='center' class='no-gutters'>
									<v-col cols='auto' class='mx-md-12 pa-0' v-if='returnThis(item.show)' @click='refresh(item.axios)'>
										<v-btn class='ma-0' small rounded color='primary'>
											<app-button-icon :icon='mdiRefresh' small color='black'/>
											<span class='black--text'>refresh</span>
										</v-btn>
									</v-col>
								</v-row>
							</v-col>
							<v-col cols='12' class='pa-0' >
								<component :is='item.component' />
							</v-col>
						</div>
					</v-expand-transition>
				</v-col>
				<v-row justify='center' class='no-gutters my-3' v-if='index !== adminRows.length -1'>
					<v-col cols='12' sm='8' md='6'>
						<v-divider />
					</v-col>
				</v-row>

				<!-- <app-divider  /> -->
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { axios_admin } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { loadingModule } from '@/store';
import { mdiChevronDown, mdiChevronUp, mdiRefresh } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { PV, TAdminAxiosNames, TAdminShow } from '@/types';
import Backup from '@/components/Admin/Backup.vue';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Email from '@/components/Admin/Email.vue';
import ErrorLog from '@/components/Admin/ErrorLog.vue';
import Limit from '@/components/Admin/Limit.vue';
import Memory from '@/components/Admin/Memory.vue';
import RegisteredUsers from '@/components/Admin/RegisteredUsers.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'settings-page',

	components: {
		appButtonIcon: ButtonIcon,
		appBackup: Backup,
		appEmail: Email,
		appLimit: Limit,
		appMemory: Memory,
		appRegisteredUsers: RegisteredUsers,
		appErrorLog: ErrorLog
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
		emailIcon (): string {
			return this.showEmail ? mdiChevronUp : mdiChevronDown;
		},
		errorIcon (): string {
			return this.showError ? mdiChevronUp : mdiChevronDown;
		},
		limitIcon (): string {
			return this.showLimit ? mdiChevronUp : mdiChevronDown;
		},
		memoryIcon (): string {
			return this.showMemory ? mdiChevronUp : mdiChevronDown;
		},
		backupIcon (): string {
			return this.showBackup ? mdiChevronUp : mdiChevronDown;
		},
		registeredUsersIcon (): string {
			return this.showRegisterUsers ? mdiChevronUp : mdiChevronDown;
		},
	},

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	methods: {
		/**
		 ** Return the value of a name this.param, used in v-for itertions
		 * @param {string} param Valid key from data: () attribute
		 */
		returnThis (param: TAdminShow | 'emailIcon' | 'errorIcon'| 'limitIcon' | 'memoryIcon' | 'backupIcon' | 'registeredUsersIcon'): boolean|string|void {
			const choices = [ 'showBackup', 'showLimit', 'showEmail', 'showError', 'showRegisterUsers', 'showMemory', 'emailIcon', 'limitIcon', 'memoryIcon', 'backupIcon', 'errorIcon', 'registeredUsersIcon' ];
			if (choices.includes(param)) return this[param];
		},

		/**
		 ** Dispatch axios request to update filelist, show filelist component
		 */
		async clicker (axios: TAdminAxiosNames, show: TAdminShow): PV {
			this.loading = true;
			if (!this[show]) await this.dispatch(axios);
			const choices = [ 'showBackup', 'showLimit', 'showEmail', 'showRegisterUsers', 'showMemory', 'showError' ];
			if (choices.includes(show)) this[show] = !this[show];
			this.loading = false;
		},

		/**
		 ** Dispatch vuex axios command
		 * @param {string} choice A valid suffix to `axios` in vuex admin dispatch section
		 */
		async dispatch (axios: TAdminAxiosNames): PV {
			switch (axios) {
			case 'backup':
				await axios_admin.backup_get();
				break;
			case 'error':
				await axios_admin.logs_get();
				break;
			case 'limit':
				await axios_admin.limit_get();
				break;
			case 'email':
				await axios_admin.email_get();
				break;
			case 'user':
				await axios_admin.user_get();
				break;
			case 'memory':
				await axios_admin.memory_get();
				break;
			}
		},
		/**
		 ** Dispatch vuex axios command to refresh chosen section
		 * @param {string} choice A valid suffix to `axios` in vuex admin dispatch section
		 */
		async refresh (axios: TAdminAxiosNames): PV {
			this.loading = true;
			await this.dispatch(axios);
			this.loading = false;
		},

		/**
		 ** Return up or down icon based on choice
		 * @param {string} choice Valid key [show] from data: () attribute
		 */
		icon (choice: TAdminShow): string {
			const i = this.returnThis(choice);
			return i ? 'chevron-up' : 'chevron-down';
		}
	},

	data: () => ({
		adminRows: [
			{
				axios: 'backup' as const,
				component: 'app-backup',
				icon: 'backupIcon' as const,
				show: 'showBackup' as const,
				title: 'Database Backups',
			},
			{
				axios: 'email' as const,
				component: 'app-email',
				icon: 'emailIcon' as const,
				show: 'showEmail' as const,
				title: 'Email',
			},
			{
				axios: 'error' as const,
				component: 'app-error-log',
				icon: 'errorIcon' as const,
				show: 'showError' as const,
				title: 'Error Logs',
			},
			{
				axios: 'user' as const,
				component: 'app-registered-users',
				icon: 'registeredUsersIcon' as const,
				show: 'showRegisterUsers' as const,
				title: 'Registered Users',
			},
			{
				axios: 'limit' as const,
				component: 'app-limit',
				icon: 'limitIcon' as const,
				show: 'showLimit' as const,
				title: 'Rate Limited Users',
			},
			{
				axios: 'memory' as const,
				component: 'app-memory',
				icon: 'memoryIcon' as const,
				show: 'showMemory' as const,
				title: 'Server Details',
			},
		],
		mdiChevronDown,
		mdiChevronUp,
		mdiRefresh,
		pageTitle: 'Admin',
		showBackup: false,
		showError: false,
		showEmail: false,
		showLimit: false,
		showMemory: false,
		showRegisterUsers: false,
	})
});
</script>