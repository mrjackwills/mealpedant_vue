<template>
	<v-container container--fluid fill-height>
		<v-row wrap justify='center' class='no-gutters'>
			<v-col cols='12' v-for='(item, index) in adminRows' :key='index'>
				<v-row wrap justify='center' align='center' class='no-gutters'>
					<v-col cols='12' sm='8'>
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
										<v-btn class='ma-0 mt-4' small rounded color='primary' variant='flat'>
											<ButtonIcon :icon='mdiRefresh' small color='black'/>
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
				<v-row justify='center' class='no-gutters ' v-if='index !== adminRows.length -1'>
					<v-col cols='12' sm='8'>
						<v-divider />
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { mdiChevronDown, mdiChevronUp, mdiRefresh } from '@mdi/js';
import type { PV, TAdminAxiosNames, TAdminShow } from '@/types';
import AdminMemory from '@/components/Admin/AdminMemory.vue';
import AdminBackup from '@/components/Admin/AdminBackup.vue';
import AdminEmail from '@/components/Admin/AdminEmail.vue';
import AdminError from '@/components/Admin/AdminError.vue';
import AdminRegisteredUsers from '@/components/Admin/AdminRegisteredUsers.vue';
import AdminLimit from '@/components/Admin/AdminLimit.vue';

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const emailIcon = computed((): string => {
	return showEmail.value ? mdiChevronUp : mdiChevronDown;
});
const errorIcon = computed((): string => {
	return showError.value ? mdiChevronUp : mdiChevronDown;
});
const limitIcon = computed((): string => {
	return showLimit.value ? mdiChevronUp : mdiChevronDown;
});
const memoryIcon = computed((): string => {
	return showMemory.value ? mdiChevronUp : mdiChevronDown;
});
const backupIcon = computed((): string => {
	return showBackup.value ? mdiChevronUp : mdiChevronDown;
});
const registeredUsersIcon = computed((): string => {
	return showRegisterUsers.value ? mdiChevronUp : mdiChevronDown;
});

onMounted(() => {
	browserModule().set_pageTitle('Admin');
	browserModule().set_description('Meal Pedant - Admin information');
});

/**
** Return the value of a name this.param, used in v-for itertions
* @param {string} param Valid key from data: () attribute
*/
const returnThis = (param: TAdminShow | 'emailIcon' | 'errorIcon'| 'limitIcon' | 'memoryIcon' | 'backupIcon' | 'registeredUsersIcon'): boolean|string|void => {
	switch (param) {
	case 'showBackup':
		return showBackup.value;
	case 'showLimit':
		return showLimit.value;
	case 'showError':
		return showError.value;
	case 'showEmail':
		return showEmail.value;
	case 'showRegisterUsers':
		return showRegisterUsers.value;
	case 'showMemory':
		return showMemory.value;
	case 'emailIcon':
		return emailIcon.value;
	case 'limitIcon':
		return limitIcon.value;
	case 'memoryIcon':
		return memoryIcon.value;
	case 'backupIcon':
		return backupIcon.value;
	case 'errorIcon':
		return errorIcon.value;
	case 'registeredUsersIcon':
		return registeredUsersIcon.value;
	}
};

const getParam = (x: TAdminShow): Ref<boolean> => {
	switch (x) {
	case 'showBackup':
		return showBackup;
	case 'showLimit':
		return showLimit;
	case 'showError':
		return showError;
	case 'showEmail':
		return showEmail;
	case 'showRegisterUsers':
		return showRegisterUsers;
	case 'showMemory':
		return showMemory;
	}
};

/**
 ** Dispatch axios request to update filelist, show filelist component
*/
const clicker = async (axios: TAdminAxiosNames, show: TAdminShow): PV => {
	loading.value = true;
	if (!getParam(show).value) await dispatch(axios);
	getParam(show).value= !getParam(show).value;
	loading.value = false;
};

/**
 ** Dispatch vuex axios command
* @param {string} choice A valid suffix to `axios` in vuex admin dispatch section
*/
const dispatch = async (axios: TAdminAxiosNames): PV => {
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
};

/**
 ** Dispatch vuex axios command to refresh chosen section
* @param {string} choice A valid suffix to `axios` in vuex admin dispatch section
*/
const refresh = async (axios: TAdminAxiosNames): PV => {
	loading.value = true;
	dispatch(axios);
	loading.value = false;
};

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
];
const showBackup = ref(false);
const showError = ref(false);
const showEmail = ref(false);
const showLimit = ref(false);
const showMemory = ref(false);
const showRegisterUsers = ref(false);
</script>