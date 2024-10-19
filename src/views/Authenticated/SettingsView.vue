<template>
	<v-container
		v-if='pageInit'
		container--fluid
		fill-height
	>
		<v-row class='ma-0 pa-0' align='center' justify='center'>
			<v-col cols='11' class='ma-0 pa-0'>
				<TwoFactor />
			</v-col>
			<v-col cols='11' class='pa-0' v-if='!setupProcessStarted && !backupProcess'>
				<v-row justify='center' class='no-gutters my-3'>
					<v-col cols='12' sm='8' md='6'>
						<v-divider />
					</v-col>
				</v-row>
			</v-col>
			<v-col cols='11' class='ma-0 pa-0 mb-8' v-if='!setupProcessStarted && !backupProcess'>
				<ChangePassword />
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';

const backupProcess = computed((): boolean => {
	return twoFAModule().backupProcess;
});
const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const setupProcessStarted = computed((): boolean => {
	return twoFAModule().setupProcessStarted;
});
const pageInit = ref(false);

onBeforeMount(async () => {
	loading.value = true;
	await axios_authenticatedUser.authenticated_get();
	pageInit.value = true;
	loading.value = false;
});
onMounted(() => {
	const browserStore = browserModule();
	browserStore.set_pageTitle('Settings');
	browserStore.set_description('Meal Pedant - User settings');
});

</script>