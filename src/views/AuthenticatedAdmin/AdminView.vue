<template>
	<v-row class='mx-3 justify-center' density='compact' wrap>
		<v-col class='cl' cols='12'>
			<v-row class=' justify-center' density='compact' wrap>
				<v-col cols='12' sm='8'>
					<router-link :to='FrontEndRoutes.ADMIN_PHOTO'>
						<v-row class='' density='compact'>
							<v-col class='' cols='12'>
								<v-row
									v-ripple
									class='align-center'
									density='compact'
									wrap
								>
									<v-col class='mr-2' cols='auto'>
										<span class='cl text-headline-medium unselectable text-white'>Photos</span>

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
			<v-row class=' justify-center pa-0 ma-0' density='compact' wrap>
				<v-col cols='12' sm='8'>
					<v-row class='' density='compact'>
						<v-col cols='12'>
							<v-row
								v-ripple
								class='align-center'
								density='compact'
								wrap
								@click='clicker(item.fetch, item.show)'
							>
								<v-col class='mr-2' cols='auto'>
									<span class='cl text-headline-medium unselectable'>{{ item.title }}</span>
								</v-col>

								<v-spacer />

								<v-col :class='{ "ml-md-12": returnThis(item.show) }' cols='auto'>
									<v-icon>{{ returnThis(item.icon) }}</v-icon>
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
							<v-row class=' justify-center' density='compact'>
								<v-col
									v-if='returnThis(item.show)'
									class='mx-md-12 pa-0'
									cols='auto'
									@click='refresh(item.fetch)'
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

			<v-row v-if='index !== adminRows.length - 1' class=' justify-center' density='compact'>
				<v-col cols='12' sm='8'>
					<v-divider />
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { PV, TAdminFetchNames, TAdminShow } from '@/types'
import { mdiChevronDown, mdiChevronUp, mdiRefresh } from '@mdi/js'
import AdminBackup from '@/components/Admin/AdminBackup.vue'
import AdminEmail from '@/components/Admin/AdminEmail.vue'
import AdminError from '@/components/Admin/AdminError.vue'
import AdminLimit from '@/components/Admin/AdminLimit.vue'
import AdminMemory from '@/components/Admin/AdminMemory.vue'
import AdminRegisteredUsers from '@/components/Admin/AdminRegisteredUsers.vue'
import { fetch_admin } from '@/services/fetch'
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

// Dispatch fetch request to update filelist, show filelist component
async function clicker (fetch: TAdminFetchNames, show: TAdminShow): PV {
	loading.value = true
	if (!getParam(show).value) await dispatch(fetch)
	getParam(show).value = !getParam(show).value
	loading.value = false
}

/*
 * Dispatch vuex fetch command
 * @param {string} choice A valid suffix to `fetch` in vuex admin dispatch section
 */
async function dispatch (fetch: TAdminFetchNames): PV {
	switch (fetch) {
		case 'backup': {
			await fetch_admin.backup_get()
			break
		}
		case 'error': {
			await fetch_admin.logs_get()
			break
		}
		case 'limit': {
			await fetch_admin.limit_get()
			break
		}
		case 'email': {
			await fetch_admin.email_get()
			break
		}
		case 'user': {
			await fetch_admin.user_get()
			break
		}
		case 'memory': {
			await fetch_admin.memory_get()
			break
		}
	}
}

/*
 * Dispatch vuex fetch command to refresh chosen section
 * @param {string} choice A valid suffix to `fetch` in admin dispatch section
 */
async function refresh (fetch: TAdminFetchNames): PV {
	loading.value = true
	dispatch(fetch)
	loading.value = false
}

const adminRows = [
	{
		component: AdminBackup,
		fetch: 'backup' as const,
		icon: 'backupIcon' as const,
		show: 'showBackup' as const,
		title: 'Database Backups',
	},
	{
		component: AdminEmail,
		fetch: 'email' as const,
		icon: 'emailIcon' as const,
		show: 'showEmail' as const,
		title: 'Email',
	},
	{
		component: AdminError,
		fetch: 'error' as const,
		icon: 'errorIcon' as const,
		show: 'showError' as const,
		title: 'Error Logs',
	},
	{
		component: AdminRegisteredUsers,
		fetch: 'user' as const,
		icon: 'registeredUsersIcon' as const,
		show: 'showRegisterUsers' as const,
		title: 'Registered Users',
	},
	{
		component: AdminLimit,
		fetch: 'limit' as const,
		icon: 'limitIcon' as const,
		show: 'showLimit' as const,
		title: 'Rate Limited Users',
	},
	{
		component: AdminMemory,
		fetch: 'memory' as const,
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
