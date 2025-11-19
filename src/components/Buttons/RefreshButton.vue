<template>
	<v-row align='center' class='ma-0 pa-0 mt-1 mt-md-4' justify='center'>
		<v-col class='cl ma-0 pa-0' cols='auto'>
			<v-btn
				color='infobar'
				density='compact'
				rounded
				size='small'
				variant='flat'
				@click='refresh'
			>
				<ButtonIcon :icon='mdiDatabaseRefresh' :small='true' />
				re-download meal data
			</v-btn>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiDatabaseRefresh } from '@mdi/js'
import { axios_adminMeal } from '@/services/axios'

// Refresh the meal data, clear filters, and if admin, check for missing meals
async function refresh (): Promise<void> {
	mealStorage.delete()
	infobarModule().$reset()
	mealModule().clear_all_filters()
	await mealStorage.seed_meal_pinia()
	if (userModule().admin) await axios_adminMeal.missing_get()
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	})
}
</script>
