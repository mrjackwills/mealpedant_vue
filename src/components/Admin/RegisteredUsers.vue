/* eslint-disable vue/valid-v-slot */
<template>
	<v-row justify='center' class='no-gutters' >
		<v-col cols='12'
			id='datatable'
			v-touch='{
				left: () => toggleDrawer(true),
				right: () => toggleDrawer(false),
			}'>
			<v-data-table
				id='datatable'
				:expanded.sync='expanded'
				:headers='registeredUsersHeaders'
				:items='registeredUsers'
				:mobile-breakpoint='0'
				:sort-desc='true'
				class='elevation-1 mt-4'
				item-key='email'
				ref='datatable'
				sort-by='admin'
				must-sort
				single-expand
			>
				<template v-slot:[`item.active`]='{item}'>
					<app-active
						:active.sync='item.active'
						:email.sync='item.email'
						patchName='active'
					/>
				</template>

				<template v-slot:[`item.admin`]='{item}'>
					<app-active
						:active.sync='item.admin'
						:email.sync='item.email'
						:readOnly='true'
						patchName=''
					/>
				</template>

				<template v-slot:[`item.tfa`]='{item}'>
					<app-active
						:active.sync='item.two_fa_active'
						:email.sync='item.email'
						:removeOnly='true'
						patchName='two_fa_secret'
					/>
				</template>

				<template v-slot:[`item.login_attempt_number`]='{item}'>
					<v-row align='center' justify='center' class='ma-o pa-0' dense>
						<v-col cols='auto' class='ma-0 pa-0' dense>
							<v-btn
								v-if='item.login_attempt_number && item.login_attempt_number > 0'
								@click='resetAttempt(item.email)'
								class='fab-fix'
								fab
								small
								text
							>
								<v-icon small color='mealtype'>{{ mdiClose }}</v-icon>
							</v-btn>
						</v-col>
						<v-col cols='auto' class='ma-0 pa-0' v-if='item.login_attempt_number && item.login_attempt_number >=1'>
							{{ item.login_attempt_number }}
						</v-col>
					</v-row>
				</template>

				<template v-slot:[`item.last`]='{item}'>
					<v-row
						v-for='(chosen, index) in [item.login_ip, item.success, item.user_agent, item.login_date]' :key='index'
						align='center'
						class='ma-0 pa-0'
						justify='start'
						dense
					>
						<v-col cols='auto' class='ma-0 pa-0'>
							<span
								:class='index === 1 && !chosen ? "mealtype--text" : ""'
								class='smalltext'
							>
								{{ chosen }}
							</span>
						</v-col>
					</v-row>
				</template>

				<template v-slot:[`item.passwordReset`]='{item}'>
					<app-password
						:email.sync='item.email'
						:passwordResetDate='item.password_reset_date'
						:password_reset_id='item.password_reset_id'
						:password_creation_ip='item.password_creation_ip'
						:reset_string='item.reset_string'

					/>
				</template>

				<template v-slot:[`item.sessions`]='{item}'>
					<v-btn
						@click='showRow(item)'
						text
						fab
						small
					>
						<v-icon>{{ activeSessionsIcon(item.email) }}</v-icon>
					</v-btn>
				</template>

				<template v-slot:expanded-item='{ headers, item}'>
					<td :colspan='headers.length'>
						<section v-if='sessionData.length >0'>
							<v-row justify='center' class='no-gutters' v-for='(session, index) in sessionData' :key='index'>
								<v-container class='pa-0'>
									<v-row justify='center' class='no-gutters'>
										<v-col cols='auto'
											v-if='!session.current'
											@click='removeSession(session.uuid, item.email)'>
											<app-button-icon
												v-ripple
												:icon='mdiClose'
												:small='true'
												class='cl'
												color='mealtype'
												margin='mr-3'
											/>
										</v-col>
										<v-col cols='auto'>
											<span
												class='primary--text mr-8'>
												{{ session.login_date }}
											</span>
										</v-col>
										<v-col cols='auto'>
											<span
												class='secondary--text'>
												<span> {{ session.end_date }}</span>
											</span>
										</v-col>
									</v-row>
									<v-row justify='center' class='no-gutters'>
										<v-col cols='12'>
											<div
												class='smalltext text-center'>
												<span>{{ session.ip }}</span>
											</div>
										</v-col>
										<v-col cols='12'>
											<div
												class='smalltext text-center'>
												<span>{{ session.user_agent }}</span>
											</div>
										</v-col>
										<v-col cols='12'>
											<div
												class='smalltext text-center'>
												<span>{{ session.uuid }}</span>
											</div>
										</v-col>
									</v-row>
									<v-row justify='center' class='no-gutters' v-if='session.current'>
										<v-col cols='auto'>
											<span class='mealtype--text'>CURRENT</span>
										</v-col>
									</v-row>
									<v-divider v-if='index !== sessionData.length -1 ' class='my-3' />
								</v-container>
							</v-row>
						</section>
						<section v-else>
							<div class='text-center'>NO SESSIONS</div>
						</section>
					</td>
				</template>
			</v-data-table>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { adminModule, drawerModule, loadingModule } from '@/store';
import { axios_admin } from '@/services/axios';
import { mdiClose, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { snackError, } from '@/services/snack';
import { TAdminSession, TAllUserInfo } from '@/types';
import Active from '@/components/Admin/UserTable/Active.vue';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Password from '@/components/Admin/UserTable/Password.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'admin-registered-users-component',

	components: {
		appButtonIcon: ButtonIcon,
		appActive: Active,
		AppPassword: Password,
	},

	beforeDestroy () {
		drawerModule().set_disabled(false);
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
		registeredUsers (): TAllUserInfo {
			return adminModule().registeredUsers;
		},
	},

	data: () => ({
		expanded: [] as Array<TAdminSession>,
		mdiClose,
		registeredUsersHeaders: [
			{
				text: 'Active',
				value: 'active',
				align: 'left',
				sortable: true,
			},
			{
				text: 'Email',
				value: 'email',
				align: 'left',
				sortable: true
			},
			{
				text: 'Admin',
				value: 'admin',
				align: 'left',
				sortable: true,
			},
			{
				text: '2FA',
				value: 'tfa',
				align: 'left',
				sortable: false,
			},
			{
				text: 'Attemps',
				value: 'login_attempt_number',
				align: 'left',
				sortable: false,
			},
			{
				text: 'Last Attempt',
				value: 'last',
				align: 'left',
				sortable: false,
			},
			{
				text: 'Sessions',
				value: 'sessions',
				align: 'left',
				sortable: false,
			},
			{
				text: 'Password Reset',
				value: 'passwordReset',
				align: 'left',
				sortable: false,
			},
		],
		sessionData: [] as Array<TAdminSession>,
	}),

	methods: {
		toggleDrawer (status: boolean): void {
			drawerModule().set_disabled(status);
		},
		activeSessionsIcon (email: string): string {
			return this.expanded[0] && this.expanded[0]?.email === email ? mdiChevronUp: mdiChevronDown;
		},
		async resetAttempt (email: string) : Promise<void> {
			await axios_admin.user_patch({ patch: { attempt: true }, email });
			await axios_admin.user_get();
		},
		
		async removeSession (uuid: string, email: string): Promise<void> {
			await axios_admin.session_delete(uuid);
			this.sessionData = await axios_admin.session_get(email);
			if (this.sessionData.length === 0) this.expanded = [];
			this.loading = false;
		},
		async showRow (item: TAdminSession): Promise<void> {
			try {
				this.loading = true;
				if (this.expanded[0] && this.expanded[0].email === item.email) {
					this.sessionData = [];
					this.expanded = [];
				}
				else {
					this.sessionData = await axios_admin.session_get(item.email);
					this.expanded = [ item ];
				}
			} catch (e) {
				const message = e instanceof Error ? e.message : 'ERROR';
				snackError({ message });
			} finally {
				this.loading = false;
			}
		},

	},
});
</script>

<style>
	#datatable th, #datatable td{
		padding: 8px;
	}
</style>