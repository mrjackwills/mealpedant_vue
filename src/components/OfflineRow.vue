<template>
	<v-alert color='error' tile class='ma-0 pa-0 no-gutters' id='offline_alert' width='100%' height='40px'>
		<v-row justify='center' color='error' class='error cl' @click='goOnline' app>
			<v-col cols='auto' class=''>
				<v-icon :icon='mdiWifiStrengthAlertOutline' />
			</v-col>
			<v-col cols='auto' class=''>
				offline
			</v-col>
		</v-row>
	</v-alert>
</template>

<script setup lang='ts'>
import { axios_authenticatedFood, axios_authenticatedUser, axios_incognito } from '@/services/axios';
import { mdiWifiStrengthAlertOutline } from '@mdi/js';
import { snackError } from '@/services/snack';

onBeforeUnmount(() => {
	clearInterval(goOnlineInterval.value);

});

const authenticated = computed((): boolean=> {
	return userModule().authenticated;
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});
const goOnlineInterval = ref(0);

const goOnline = async (): Promise<void> => {
	try {
		loading.value = true;
		await axios_incognito.online_get();
		if (authenticated.value) await Promise.all([
			axios_authenticatedUser.authenticated_get(),
			axios_authenticatedFood.last_get(),
			axios_authenticatedFood.all_get(),
			axios_authenticatedFood.category_get()
		]);
	} catch (e) {
		const message = e instanceof Error ? e.message : 'ERROR';
		snackError({ message });
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	goOnlineInterval.value = window.setInterval(() => goOnline(), 10000);
});
</script>