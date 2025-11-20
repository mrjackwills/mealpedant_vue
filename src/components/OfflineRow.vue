<template>
	<v-alert
		id='offline_alert'
		class='ma-0 pa-0 no-gutters'
		color='error'
		height='40px'
		tile
		width='100%'
	>
		<v-row
			app
			class='error cl'
			color='error'
			justify='center'
			@click='goOnline'
		>
			<v-col class='' cols='auto'>
				<v-icon :icon='mdiWifiStrengthAlertOutline' />
			</v-col>
			<v-col class='' cols='auto'>
				offline
			</v-col>
		</v-row>
	</v-alert>
</template>

<script setup lang='ts'>
import { mdiWifiStrengthAlertOutline } from '@mdi/js'
import { axios_adminMeal, axios_incognito } from '@/services/axios'
import { snackError } from '@/services/snack'

onBeforeUnmount(() => {
	clearInterval(goOnlineInterval.value)
})

const authenticated = computed(() => userModule().authenticated)

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})
const goOnlineInterval = ref(0)

async function goOnline (): Promise<void> {
	try {
		loading.value = true
		await axios_incognito.online_get()
		if (authenticated.value) {
			mealStorage.delete()
			infobarModule().$reset()
			mealModule().clear_all_filters()
			await mealStorage.seed_meal_pinia()
			if (userModule().admin) await axios_adminMeal.missing_get()
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'ERROR'
		snackError({ message })
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	goOnlineInterval.value = window.setInterval(async () => await goOnline(), 10_000)
})
</script>
