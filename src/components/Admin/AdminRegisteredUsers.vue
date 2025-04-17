<template>
	<v-row justify='center' class='' width='100%'>

		<v-col cols='12' md='10' id='datatable' v-touch='{
			left: () => toggleDrawer(true),
			right: () => toggleDrawer(false),
		}'>

			<v-data-table-virtual :headers='registeredUsersHeaders' :items='registeredUsers' height='300'
				:mobile='smAndDown'
				class='elevation-1 mt-4' density='compact' id='datatable'>
				<template v-slot:[`item.active`]='{ item }'>
					<UserActive v-model:active='item.active' v-model:email='item.email' patchName='active' />
				</template>

				<template v-slot:[`item.admin`]='{ item }'>
					<UserActive v-model:active='item.admin' v-model:email='item.email' :readOnly='true' />
				</template>

				<template v-slot:[`item.tfa`]='{ item }'>
					<UserActive v-model:active='item.two_fa_active' v-model:email='item.email' :removeOnly='true'
						patchName='two_fa_secret' />
				</template>

				<template v-slot:[`item.login_attempt_number`]='{ item }'>
					<v-row align='center' justify='center' class='ma-0 pa-0' dense>
						<v-col cols='auto' class='ma-0 pa-0' dense>
							<v-btn v-if='item.login_attempt_number && item.login_attempt_number > 0'
								@click='resetAttempt(item.email)' class='fab-fix' fab size='small' variant='text'>
								<v-icon size='small' color='mealtype' :icon='mdiClose' />
							</v-btn>
						</v-col>
						<v-col cols='auto' class='ma-0 pa-0'
							v-if='item.login_attempt_number && item.login_attempt_number >= 1'>
							{{ item.login_attempt_number }}
						</v-col>
					</v-row>
				</template>

				<template v-slot:[`item.last`]='{ item }'>
					<v-row v-for='(chosen, index) in [item.login_ip, item.login_success]' :key='index' align='center'
						class='ma-0 pa-0' justify='start' denssty='compact'>
						<v-col cols='auto' class='ma-0 pa-0'>
							<span :class='index === 1 && !chosen ? "text-mealtype" : ""' class='smalltext'>
								{{ chosen }}
							</span>
						</v-col>
					</v-row>
				</template>

				<template v-slot:[`item.passwordReset`]='{ item }'>
					<UserPassword :email='item.email' :passwordResetDate='item.password_reset_date'
						:password_reset_id='item.password_reset_id'
						:password_creation_ip='item.password_reset_creation_ip' :reset_string='item.reset_string' />
				</template>

				<template v-slot:[`item.sessions`]='{ item, internalItem, toggleExpand }'>
					<v-btn @click='showRow(item.email, toggleExpand, internalItem)' variant='text' size='small' fab>
						<v-icon :icon='activeSessionsIcon(item.email)' />
					</v-btn>
				</template>

				<template v-slot:expanded-row='{ item, columns }'>
					<tr v-if='expandedEmail === item.email'>
						<td :colspan='columns.length'>

							<v-row justify='center' class='ma-0 pa-0 my-4'>
								<v-col cols='11' class='ma-0 pa-0'>
									<section v-if='sessionData.length > 0'>

										<v-row justify='center' class='' v-for='(session, index) in sessionData'
											:key='index'>
											<v-row justify='center' class='ma-0 pa-0 text-caption'>
												<v-col cols='12' class='ma-0 pa-0'>

													<v-row justify='center' class='ma-0 pa-0'>
														<v-col cols='auto' class='ma-0 pa-0' v-if='!session.current'
															@click='removeSession(session.ulid, item.email)'>
															<ButtonIcon v-ripple :icon='mdiClose' size='small'
																class='cl' color='mealtype' margin='mr-3' />
														</v-col>

														<v-col cols='auto' class='ma-0 pa-0'>
															<span class='text-primary mr-8'>
																{{ session.login_date }}
															</span>
														</v-col>
														<v-col cols='auto' class='ma-0 pa-0'>
															<span class='text-secondary'> {{ session.end_date }}
															</span>
														</v-col>
													</v-row>
												</v-col>
												<v-col cols='12' class='ma-0 pa-0'>
													<span class='smalltext text-center'>
														{{ session.ip }}
													</span>
												</v-col>
												<v-col cols='12' class='ma-0 pa-0'>
													<span class='smalltext text-center'>
														{{ session.user_agent }}
													</span>
												</v-col>
												<v-col cols='12' class='ma-0 pa-0'>
													<span class='smalltext text-center'>
														{{ session.ulid }}
													</span>
												</v-col>

												<v-col cols='12' class='ma-0 pa-0' v-if='session.current'>
													<span class='smalltext text-center text-mealtype'>CURRENT</span>
												</v-col>
											</v-row>
											<v-divider v-if='index !== sessionData.length - 1' class='my-3' />
										</v-row>
									</section>

									<v-row justify='center' v-else>
										<v-col cols='auto'>
											no sessions
										</v-col>
									</v-row>
								</v-col>
							</v-row>

						</td>
					</tr>
				</template>
			</v-data-table-virtual>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { mdiClose, mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { snackError } from '@/services/snack';
import type { PV, TAdminSession, TAllUserInfo } from '@/types';
import type { VDataTableRow } from 'vuetify/components/VDataTable';
import { useDisplay } from 'vuetify';

const { smAndDown } = useDisplay();
const expandedEmail = ref(undefined as undefined | string);
const expandedRow = ref(false);

const sessionData = ref([] as Array<TAdminSession>);

const getSessions = async (email: string): PV => {
	try {
		loading.value = true;
		const session = await axios_admin.session_get(email);
		sessionData.value = session;
	} catch (e) {
		const message = e instanceof Error ? e.message : 'ERROR';
		snackError({ message });
	} finally {
		loading.value = false;
	}
};

// DataTableItem isn't exported in an easy way, hence this
type item = NonNullable<VDataTableRow['$props']['item']>;

const showRow = async (email: string, fn: (x: item) => void, da: item): PV => {

	if (expandedEmail.value === email && expandedRow.value) {
		fn(da);
		expandedEmail.value = undefined;
		expandedRow.value = false;
	} else if (!expandedEmail.value && !expandedRow.value) {
		await getSessions(email);

		expandedEmail.value = email;

		expandedRow.value = true;
		fn(da);
	} else if (expandedEmail.value !== email && expandedRow.value) {
		await getSessions(email);
		expandedEmail.value = email;
		expandedRow.value = true;
	}
};

onBeforeUnmount(() => {
	drawerModule().set_disabled(false);
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const registeredUsers = computed((): TAllUserInfo => adminModule().registeredUsers);

const expanded = ref([]);
const registeredUsersHeaders = [
	{
		title: 'Active',
		value: 'active',
		align: 'start',
		sortable: true
	},
	{
		title: 'Email',
		value: 'email',
		align: 'start',
		sortable: true
	},
	{
		title: 'Admin',
		value: 'admin',
		align: 'start',
		sortable: true
	},
	{
		title: '2FA',
		value: 'tfa',
		align: 'start',
		sortable: false
	},
	{
		title: 'Attempts',
		value: 'login_attempt_number',
		align: 'start',
		sortable: false
	},
	{
		title: 'Last Attempt',
		value: 'last',
		align: 'start',
		sortable: false
	},
	{
		title: 'Sessions',
		value: 'sessions',
		align: 'start',
		sortable: false
	},
	{
		title: 'Password Reset',
		value: 'passwordReset',
		align: 'start',
		sortable: false
	}
] as const;

const toggleDrawer = (status: boolean): void => {
	drawerModule().set_disabled(status);
};

const activeSessionsIcon = (email: string): string => {
	return expandedEmail.value === email && expandedRow.value ? mdiChevronUp : mdiChevronDown;
};
const resetAttempt = async (email: string): PV => {
	await axios_admin.user_patch({
		patch: { attempt: true },
		email
	});
	await axios_admin.user_get();
};

const removeSession = async (ulid: string, email: string): PV => {
	await axios_admin.session_delete(ulid);
	sessionData.value = await axios_admin.session_get(email);
	if (sessionData.value.length === 0) expanded.value = [];
	loading.value = false;
};

</script>

<style>
#datatable th,
#datatable td {
	padding: 2px;
}
</style>