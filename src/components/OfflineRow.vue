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
import { axios_adminMeal, axios_incognito } from '@/services/axios';
import { mdiWifiStrengthAlertOutline } from '@mdi/js';
import { snackError } from '@/services/snack';

onBeforeUnmount(() => {
	clearInterval(goOnlineInterval.value);
});

const authenticated = computed(() => userModule().authenticated);

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
		if (authenticated.value) {
			mealStorage.delete();
			infobarModule().$reset();
			mealModule().clear_all_filters();
			await mealStorage.seed_meal_pinia();
			if (userModule().admin) await axios_adminMeal.missing_get();
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'ERROR';
		snackError({ message });
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	goOnlineInterval.value = window.setInterval(async () => await goOnline(), 10000);
});
</script>
