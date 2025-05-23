<template>
	<v-row justify='space-around' class='ma-0 pa-0'>
		<v-col cols='5' md='3' class='ma-0 pa-0 mt-md-8'>
			<v-text-field v-model='startDate' :hint='hintStartDate' :prepend-inner-icon='mdiCalendarStart'
				@click='showStartDate = !showStartDate' :clearable='false' label='start'
				variant='underlined' persistent-hint readonly
				density='comfortable'
			>
				<v-menu v-model='showStartDate' activator='parent' :close-on-content-click='false'>
					<v-date-picker v-model='startModel' first-day-of-week='1' :min='genesisDateString()'
						:max='todayDateString()' />
				</v-menu>
			</v-text-field>
		</v-col>

		<v-col cols='5' md='3' class='ma-0 pa-0 mt-md-8'>
			<v-text-field v-model='endDate' :hint='hintEndDate' :prepend-inner-icon='mdiCalendarEnd'
				@click='showEndDate = !showEndDate' :clearable='false' label='end'
				variant='underlined' persistent-hint readonly
				density='comfortable'>
				<v-menu v-model='showEndDate' activator='parent' :close-on-content-click='false'>
					<v-date-picker v-model='endModel' first-day-of-week='1' :min='genesisDateString()'
						:max='todayDateString()' />
				</v-menu>
			</v-text-field>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiCalendarStart, mdiCalendarEnd } from '@mdi/js';
import { convert_date, todayDateString, genesisDateString } from '@/vanillaTS/helpers';
import { snackError } from '@/services/snack';

const startModel = ref(undefined as undefined | Date);
const showStartDate = ref(false);

const endModel = ref(undefined as undefined | Date);
const showEndDate = ref(false);
const mealStore = mealModule();

onMounted(() => {
	if (mealStore.search_by.start_date) startModel.value = new Date(mealStore.search_by.start_date);
	if (mealStore.search_by.end_date) endModel.value = new Date(mealStore.search_by.end_date);
});

watch(startModel, (i) => {
	if (i) {
		startDate.value = convert_date(String(i));
		if (endModel.value && i < endModel.value ) {
			mealStore.set_search_by_start_date(startDate.value);
			showStartDate.value = false;
		} else {
			snackError({ message: 'Invalid start date' });
		}
	}
});

watch(endModel, (i) => {
	if (i) {
		if (startModel.value && i > startModel.value) {
			endDate.value = convert_date(String(i));
			mealStore.set_search_by_end_date(endDate.value);
			showEndDate.value = false;
		} else snackError({ message: 'Invalid end date' });
	}
});

const startDate = ref(genesisDateString());
const endDate = ref(todayDateString());

const is_filtered = computed(() => mealStore.is_filtered);
watch(is_filtered, (i) => {
	if (!i) {
		endDate.value = todayDateString();
		startDate.value = genesisDateString();
	}
});

const hintStartDate = computed(() => startDate.value === genesisDateString() ? 'Meal Pedant genesis' : '');
const hintEndDate = computed(() => endDate.value === todayDateString() ? 'Today' : '');

</script>