<template>
	<v-row class='no-gutters mx-3' justify='center' wrap>
		<v-col class='cl' cols='12'>
			<v-row align='center' class='no-gutters' justify='center' wrap>
				<v-col cols='12' sm='8'>
					<router-link :to='FrontEndRoutes.ADMIN_PHOTO'>
						<v-row align='center' class='no-gutters'>
							<v-col class='' cols='12'>
								<v-row v-ripple align='center' class='no-gutters' wrap>
									<v-col class='mr-2' cols='auto'>
										<h2 class='text-white unselectable'>Photos</h2>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
					</router-link>
					<v-divider />
				</v-col>
			</v-row>
		</v-col>
		<v-col v-for='(item, index) in adminRows' :key='index' cols='12'>
			<v-row align='center' class='no-gutters' justify='center' wrap>
				<v-col cols='12' sm='8'>
					<v-row align='center' class='no-gutters'>
						<v-col cols='12'>
							<v-row
								v-ripple
								align='center'
								class='no-gutters'
								wrap
								@click='clicker(item.axios, item.show)'
							>
								<v-col class='mr-2' cols='auto'>
									<h2 class='cl unselectable'>{{ item.title }}</h2>
								</v-col>
								<v-spacer />
								<v-col :class='{ "ml-md-12": returnThis(item.show) }' cols='auto'>
									<v-icon style='vertical-align: middle;'>{{ returnThis(item.icon) }}</v-icon>
								</v-col>
							</v-row>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
			<v-col class='pa-1' cols='12'>
				<v-expand-transition>
					<div v-if='returnThis(item.show)'>
						<v-col class='pa-0' cols='12'>
							<v-row class='no-gutters' justify='center'>
								<v-col
									v-if='returnThis(item.show)'
									class='mx-md-12 pa-0'
									cols='auto'
									@click='refresh(item.axios)'
								>
									<v-btn
										class='ma-0 mt-4'
										color='primary'
										rounded
										size='small'
										variant='flat'
									>
										<ButtonIcon color='black' :icon='mdiRefresh' size='small' />
										<span class='text-black'>refresh</span>
									</v-btn>
								</v-col>
							</v-row>
						</v-col>
						<v-col class='pa-0' cols='12'>
							<component :is='item.component' />
						</v-col>
					</div>
				</v-expand-transition>
			</v-col>
			<v-row v-if='index !== adminRows.length - 1' class='no-gutters ' justify='center'>
				<v-col cols='12' sm='8'>
					<v-divider />
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { PV, TAdminAxiosNames, TAdminShow } from '@/types'
import { mdiChevronDown, mdiChevronUp, mdiRefresh } from '@mdi/js'
import AdminBackup from '@/components/Admin/AdminBackup.vue'
import AdminEmail from '@/components/Admin/AdminEmail.vue'
import AdminError from '@/components/Admin/AdminError.vue'
import AdminLimit from '@/components/Admin/AdminLimit.vue'
import AdminMemory from '@/components/Admin/AdminMemory.vue'
import AdminRegisteredUsers from '@/components/Admin/AdminRegisteredUsers.vue'
import { axios_admin } from '@/services/axios'
import { FrontEndRoutes } from '@/types/const_routes'

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const emailIcon = computed(() => showEmail.value ? mdiChevronUp : mdiChevronDown)
const errorIcon = computed(() => showError.value ? mdiChevronUp : mdiChevronDown)
const limitIcon = computed(() => showLimit.value ? mdiChevronUp : mdiChevronDown)
const memoryIcon = computed(() => showMemory.value ? mdiChevronUp : mdiChevronDown)
const backupIcon = computed(() => showBackup.value ? mdiChevronUp : mdiChevronDown)
const registeredUsersIcon = computed(() => showRegisterUsers.value ? mdiChevronUp : mdiChevronDown)

onMounted(() => {
	browserModule().set_pageTitle('Admin')
	browserModule().set_description('Meal Pedant - Admin information')
})

/*
 * Return the value of a name this.param, used in v-for iterations
 * @param {string} param Valid key from data: () attribute
 */
function returnThis (param: TAdminShow | 'emailIcon' | 'errorIcon' | 'limitIcon' | 'memoryIcon' | 'backupIcon' | 'registeredUsersIcon'): boolean | string | null {
	switch (param) {
		case 'showBackup': {
			return showBackup.value
		}
		case 'showLimit': {
			return showLimit.value
		}
		case 'showError': {
			return showError.value
		}
		case 'showEmail': {
			return showEmail.value
		}
		case 'showRegisterUsers': {
			return showRegisterUsers.value
		}
		case 'showMemory': {
			return showMemory.value
		}
		case 'emailIcon': {
			return emailIcon.value
		}
		case 'limitIcon': {
			return limitIcon.value
		}
		case 'memoryIcon': {
			return memoryIcon.value
		}
		case 'backupIcon': {
			return backupIcon.value
		}
		case 'errorIcon': {
			return errorIcon.value
		}
		case 'registeredUsersIcon': {
			return registeredUsersIcon.value
		}
	}
}

function getParam (x: TAdminShow): Ref<boolean> {
	switch (x) {
		case 'showBackup': {
			return showBackup
		}
		case 'showLimit': {
			return showLimit
		}
		case 'showError': {
			return showError
		}
		case 'showEmail': {
			return showEmail
		}
		case 'showRegisterUsers': {
			return showRegisterUsers
		}
		case 'showMemory': {
			return showMemory
		}
	}
}

// Dispatch axios request to update filelist, show filelist component
async function clicker (axios: TAdminAxiosNames, show: TAdminShow): PV {
	loading.value = true
	if (!getParam(show).value) await dispatch(axios)
	getParam(show).value = !getParam(show).value
	loading.value = false
}

/*
 * Dispatch vuex axios command
 * @param {string} choice A valid suffix to `axios` in vuex admin dispatch section
 */
async function dispatch (axios: TAdminAxiosNames): PV {
	switch (axios) {
		case 'backup': {
			await axios_admin.backup_get()
			break
		}
		case 'error': {
			await axios_admin.logs_get()
			break
		}
		case 'limit': {
			await axios_admin.limit_get()
			break
		}
		case 'email': {
			await axios_admin.email_get()
			break
		}
		case 'user': {
			await axios_admin.user_get()
			break
		}
		case 'memory': {
			await axios_admin.memory_get()
			break
		}
	}
}

/*
 * Dispatch vuex axios command to refresh chosen section
 * @param {string} choice A valid suffix to `axios` in vuex admin dispatch section
 */
async function refresh (axios: TAdminAxiosNames): PV {
	loading.value = true
	dispatch(axios)
	loading.value = false
}

const adminRows = [
	{
		axios: 'backup' as const,
		component: AdminBackup,
		icon: 'backupIcon' as const,
		show: 'showBackup' as const,
		title: 'Database Backups',
	},
	{
		axios: 'email' as const,
		component: AdminEmail,
		icon: 'emailIcon' as const,
		show: 'showEmail' as const,
		title: 'Email',
	},
	{
		axios: 'error' as const,
		component: AdminError,
		icon: 'errorIcon' as const,
		show: 'showError' as const,
		title: 'Error Logs',
	},
	{
		axios: 'user' as const,
		component: AdminRegisteredUsers,
		icon: 'registeredUsersIcon' as const,
		show: 'showRegisterUsers' as const,
		title: 'Registered Users',
	},
	{
		axios: 'limit' as const,
		component: AdminLimit,
		icon: 'limitIcon' as const,
		show: 'showLimit' as const,
		title: 'Rate Limited Users',
	},
	{
		axios: 'memory' as const,
		component: AdminMemory,
		icon: 'memoryIcon' as const,
		show: 'showMemory' as const,
		title: 'Server Details',
	},
]
const showBackup = ref(false)
const showError = ref(false)
const showEmail = ref(false)
const showLimit = ref(false)
const showMemory = ref(false)
const showRegisterUsers = ref(false)
</script>
