<template>
	<v-row class='ma-0 pa-0' justify='space-around'>
		<v-col class='ma-0 pa-0 mt-md-8' cols='5' md='3'>
			<v-text-field
				v-model='startDate'
				:clearable='false'
				density='comfortable'
				:hint='hintStartDate'
				label='start'
				persistent-hint
				:prepend-inner-icon='mdiCalendarStart'
				readonly
				variant='underlined'
				@click='showStartDate = !showStartDate'
			>
				<v-menu v-model='showStartDate' activator='parent' :close-on-content-click='false'>
					<v-date-picker
						v-model='startModel'
						first-day-of-week='1'
						:max='todayDateString()'
						:min='genesisDateString()'
					/>
				</v-menu>
			</v-text-field>
		</v-col>

		<v-col class='ma-0 pa-0 mt-md-8' cols='5' md='3'>
			<v-text-field
				v-model='endDate'
				:clearable='false'
				density='comfortable'
				:hint='hintEndDate'
				label='end'
				persistent-hint
				:prepend-inner-icon='mdiCalendarEnd'
				readonly
				variant='underlined'
				@click='showEndDate = !showEndDate'
			>
				<v-menu v-model='showEndDate' activator='parent' :close-on-content-click='false'>
					<v-date-picker
						v-model='endModel'
						first-day-of-week='1'
						:max='todayDateString()'
						:min='genesisDateString()'
					/>
				</v-menu>
			</v-text-field>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { u } from '@/types'
import { mdiCalendarEnd, mdiCalendarStart } from '@mdi/js'
import { snackError } from '@/services/snack'
import { convert_date, genesisDateString, todayDateString } from '@/vanillaTS/helpers'

const startModel = ref(undefined as u<Date>)
const showStartDate = ref(false)

const endModel = ref(undefined as u<Date>)
const showEndDate = ref(false)
const mealStore = mealModule()

onMounted(() => {
	if (mealStore.search_by.start_date) startModel.value = new Date(mealStore.search_by.start_date)
	if (mealStore.search_by.end_date) endModel.value = new Date(mealStore.search_by.end_date)
})

watch(startModel, (i: u<Date>) => {
	if (i) {
		startDate.value = convert_date(String(i))
		if (endModel.value && i < endModel.value) {
			mealStore.set_search_by_start_date(startDate.value)
			showStartDate.value = false
		} else {
			snackError({ message: 'Invalid start date' })
		}
	}
})

watch(endModel, (i: u<Date>) => {
	if (i) {
		if (startModel.value && i > startModel.value) {
			endDate.value = convert_date(String(i))
			mealStore.set_search_by_end_date(endDate.value)
			showEndDate.value = false
		} else snackError({ message: 'Invalid end date' })
	}
})

const startDate = ref(genesisDateString())
const endDate = ref(todayDateString())

const is_filtered = computed(() => mealStore.is_filtered)
watch(is_filtered, (i: boolean) => {
	if (!i) {
		endDate.value = todayDateString()
		startDate.value = genesisDateString()
	}
})

const hintStartDate = computed(() => startDate.value === genesisDateString() ? 'Meal Pedant genesis' : '')
const hintEndDate = computed(() => endDate.value === todayDateString() ? 'Today' : '')

</script>
