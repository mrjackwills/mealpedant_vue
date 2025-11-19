<template>
	<v-row class='' justify='center' width='100%'>

		<v-col
			id='datatable'
			v-touch='{
				left: () => toggleDrawer(true),
				right: () => toggleDrawer(false),
			}'
			cols='12'
			md='10'
		>

			<v-data-table-virtual
				id='datatable'
				class='elevation-1 mt-4'
				density='compact'
				:headers='registeredUsersHeaders'
				height='300'
				:items='registeredUsers'
				:mobile='smAndDown'
			>
				<template #[`item.active`]='{ item: item_active }'>
					<UserActive v-model:active='item_active.active' v-model:email='item_active.email' patch-name='active' />
				</template>

				<template #[`item.admin`]='{ item: item_admin }'>
					<UserActive v-model:active='item_admin.admin' v-model:email='item_admin.email' :read-only='true' />
				</template>

				<template #[`item.tfa`]='{ item: item_tfa }'>
					<UserActive
						v-model:active='item_tfa.two_fa_active'
						v-model:email='item_tfa.email'
						patch-name='two_fa_secret'
						:remove-only='true'
					/>
				</template>

				<template #[`item.login_attempt_number`]='{ item: item_log }'>
					<v-row align='center' class='ma-0 pa-0' dense justify='center'>
						<v-col class='ma-0 pa-0' cols='auto' dense>
							<v-btn
								v-if='item_log.login_attempt_number && item_log.login_attempt_number > 0'
								class='fab-fix'
								fab
								size='small'
								variant='text'
								@click='resetAttempt(item_log.email)'
							>
								<v-icon color='mealtype' :icon='mdiClose' size='small' />
							</v-btn>
						</v-col>
						<v-col
							v-if='item_log.login_attempt_number && item_log.login_attempt_number >= 1'
							class='ma-0 pa-0'
							cols='auto'
						>
							{{ item_log.login_attempt_number }}
						</v-col>
					</v-row>
				</template>

				<template #[`item.last`]='{ item: itam_last }'>
					<v-row
						v-for='(chosen, index) in [itam_last.login_ip, itam_last.login_success]'
						:key='index'
						align='center'
						class='ma-0 pa-0'
						denssty='compact'
						justify='start'
					>
						<v-col class='ma-0 pa-0' cols='auto'>
							<span class='smalltext' :class='index === 1 && !chosen ? "text-mealtype" : ""'>
								{{ chosen }}
							</span>
						</v-col>
					</v-row>
				</template>

				<template #[`item.passwordReset`]='{ item: item_password }'>
					<UserPassword
						:email='item_password.email'
						:password-creation-ip='item_password.password_reset_creation_ip'
						:password-reset-date='item_password.password_reset_date'
						:password-reset-it='item_password.password_reset_id'
						:reset_string='item_password.reset_string'
					/>
				</template>

				<template #[`item.sessions`]='{ item: item_sessions, internalItem, toggleExpand }'>
					<v-btn fab size='small' variant='text' @click='showRow(item_sessions.email, toggleExpand, internalItem)'>
						<v-icon :icon='activeSessionsIcon(item_sessions.email)' />
					</v-btn>
				</template>

				<template #expanded-row='{ item: item_expand, columns }'>
					<tr v-if='expandedEmail === item_expand.email'>
						<td :colspan='columns.length'>

							<v-row class='ma-0 pa-0 my-4' justify='center'>
								<v-col class='ma-0 pa-0' cols='11'>
									<section v-if='sessionData.length > 0'>

										<v-row
											v-for='(session, index) in sessionData'
											:key='index'
											class=''
											justify='center'
										>
											<v-row class='ma-0 pa-0 text-caption' justify='center'>
												<v-col class='ma-0 pa-0' cols='12'>

													<v-row class='ma-0 pa-0' justify='center'>
														<v-col
															v-if='!session.current'
															class='ma-0 pa-0'
															cols='auto'
															@click='removeSession(session.ulid, item_expand.email)'
														>
															<ButtonIcon
																v-ripple
																class='cl'
																color='mealtype'
																:icon='mdiClose'
																margin='mr-3'
																size='small'
															/>
														</v-col>

														<v-col class='ma-0 pa-0' cols='auto'>
															<span class='text-primary mr-8'>
																{{ session.login_date }}
															</span>
														</v-col>
														<v-col class='ma-0 pa-0' cols='auto'>
															<span class='text-secondary'> {{ session.end_date }}
															</span>
														</v-col>
													</v-row>
												</v-col>
												<v-col class='ma-0 pa-0' cols='12'>
													<span class='smalltext text-center'>
														{{ session.ip }}
													</span>
												</v-col>
												<v-col class='ma-0 pa-0' cols='12'>
													<span class='smalltext text-center'>
														{{ session.user_agent }}
													</span>
												</v-col>
												<v-col class='ma-0 pa-0' cols='12'>
													<span class='smalltext text-center'>
														{{ session.ulid }}
													</span>
												</v-col>

												<v-col v-if='session.current' class='ma-0 pa-0' cols='12'>
													<span class='smalltext text-center text-mealtype'>CURRENT</span>
												</v-col>
											</v-row>
											<v-divider v-if='index !== sessionData.length - 1' class='my-3' />
										</v-row>
									</section>

									<v-row v-else justify='center'>
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
import type { VDataTableRow } from 'vuetify/components/VDataTable'
import type { PV, TAdminSession, TAllUserInfo } from '@/types'
import { mdiChevronDown, mdiChevronUp, mdiClose } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { axios_admin } from '@/services/axios'
import { snackError } from '@/services/snack'

const { smAndDown } = useDisplay()
const expandedEmail = ref(undefined as undefined | string)
const expandedRow = ref(false)

const sessionData = ref([] as Array<TAdminSession>)

async function getSessions (email: string): PV {
	try {
		loading.value = true
		const session = await axios_admin.session_get(email)
		sessionData.value = session
	} catch (error) {
		const message = error instanceof Error ? error.message : 'ERROR'
		snackError({ message })
	} finally {
		loading.value = false
	}
}

// DataTableItem isn't exported in an easy way, hence this
type item = NonNullable<VDataTableRow['$props']['item']>

async function showRow (email: string, fn: (x: item) => void, da: item): PV {
	if (expandedEmail.value === email && expandedRow.value) {
		fn(da)
		expandedEmail.value = undefined
		expandedRow.value = false
	} else if (!expandedEmail.value && !expandedRow.value) {
		await getSessions(email)

		expandedEmail.value = email

		expandedRow.value = true
		fn(da)
	} else if (expandedEmail.value !== email && expandedRow.value) {
		await getSessions(email)
		expandedEmail.value = email
		expandedRow.value = true
	}
}

onBeforeUnmount(() => {
	drawerModule().set_disabled(false)
})

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const registeredUsers = computed((): TAllUserInfo => adminModule().registeredUsers)

const expanded = ref([])
const registeredUsersHeaders = [
	{
		title: 'Active',
		value: 'active',
		align: 'start',
		sortable: true,
	},
	{
		title: 'Email',
		value: 'email',
		align: 'start',
		sortable: true,
	},
	{
		title: 'Admin',
		value: 'admin',
		align: 'start',
		sortable: true,
	},
	{
		title: '2FA',
		value: 'tfa',
		align: 'start',
		sortable: false,
	},
	{
		title: 'Attempts',
		value: 'login_attempt_number',
		align: 'start',
		sortable: false,
	},
	{
		title: 'Last Attempt',
		value: 'last',
		align: 'start',
		sortable: false,
	},
	{
		title: 'Sessions',
		value: 'sessions',
		align: 'start',
		sortable: false,
	},
	{
		title: 'Password Reset',
		value: 'passwordReset',
		align: 'start',
		sortable: false,
	},
] as const

function toggleDrawer (status: boolean): void {
	drawerModule().set_disabled(status)
}

function activeSessionsIcon (email: string): string {
	return expandedEmail.value === email && expandedRow.value ? mdiChevronUp : mdiChevronDown
}
async function resetAttempt (email: string): PV {
	await axios_admin.user_patch({
		patch: { attempt: true },
		email,
	})
	await axios_admin.user_get()
}

async function removeSession (ulid: string, email: string): PV {
	await axios_admin.session_delete(ulid)
	sessionData.value = await axios_admin.session_get(email)
	if (sessionData.value.length === 0) expanded.value = []
	loading.value = false
}

</script>

<style>
#datatable th,
#datatable td {
	padding: 2px;
}
</style>
