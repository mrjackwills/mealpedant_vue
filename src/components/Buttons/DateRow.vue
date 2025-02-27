<template>
	<v-row justify='center' class='my-0'>
		<v-col cols='12'>
		</v-col>
		<v-col cols='5' class=''>

			<v-text-field
				v-model='startDate'
				:hint='hintStartDate'
				:prepend-icon='mdiCalendarBlank'
				@click='showStartDate=!showStartDate'
				@click:clear='resetStartDate'
				:clearable='true'
				label='Start Date'
				persistent-hint
				readonly
				variant='underlined'
			>
				<v-menu
					v-model='showStartDate'
					activator='parent'
					:close-on-content-click='false'
				>
					<!-- v-model='startModel' -->
					<v-date-picker
						first-day-of-week='1'
						@click:cancel='showStartDate=!showStartDate'
						@click:save='showStartDate=!showStartDate'
						:min='startDate'
						:max='endDate'
					/>
				</v-menu>
			</v-text-field>
		</v-col>
		<v-col cols='5' class=''>

			<v-text-field
				v-model='endDate'
				:hint='hintEndDate'
				:prepend-icon='mdiCalendarToday'
				@click='showEndDate=!showEndDate'
				@click:clear='resetEndDate'
				:clearable='true'
				label='End Date'
				persistent-hint
				readonly
				variant='underlined'
			>
				<v-menu
					v-model='showEndDate'
					activator='parent'
					:close-on-content-click='false'
				>
					<v-date-picker
						v-model='endModel'
						first-day-of-week='1'
						@click:cancel='showEndDate=!showEndDate'
						@click:save='showEndDate=!showEndDate'
					/>
				</v-menu>
			</v-text-field>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiCalendarBlank, mdiCalendarToday } from '@mdi/js';
import { snackError } from '@/services/snack';
import type { TCategory, TMealType, TPiniaDateMeal } from '@/types';
import { genesisDate } from '@/vanillaTS/globalConst';
import { useRouter } from 'vue-router';
import { convert_date } from '@/vanillaTS/date_convert';

const router = useRouter();
const route = useRoute();
const endModel = ref(undefined);
const startModel = ref([]);

const resetEndDate = (): void=> {
	endDate.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const resetStartDate = (): void=> {
	startDate.value = new Date(genesisDate).toISOString().slice(0, 10);
};
watch(startModel, (i) => {
	if (i) {
		startDate.value = convert_date(String(i));
		filterDate();
	}
});

watch(endModel, (i) => {
	if (i) {
		endDate.value = convert_date(String(i));
		filterDate();
	}
}, { deep: true });

const showStartDate = ref(false);
const showEndDate = ref(false);

const hintStartDate = computed((): string =>{
	return startDate.value === new Date(genesisDate).toISOString().slice(0, 10) ? 'Meal Pedant genesis' : '';
});
const hintEndDate = computed((): string =>{
	return endDate.value === new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) ? 'Today' : '';
});

const startDate = computed({
	get (): string {
		return foodModule().date_start;
	},
	set (x: string): void {
		foodModule().set_date_start(x);
	}
});

const endDate = computed({
	get (): string {
		return foodModule().date_end;
	},
	set (s: string): void {
		const queries = route.query;
		const query = queries?.endDate;
		if (s && s !== query) {
			router.replace({
				path: route.path,
				query: { endDate: s }
			});
		}
		foodModule().set_date_end(s);
	}
});

const original = computed({
	get (): boolean {
		return foodModule().original;
	},
	set (b: boolean): void {
		foodModule().set_original(b);
	}
});
	
const filterDate = (): void => {
	if (startDate.value >= endDate.value) {
		snackError({ message: 'Start date must be before end date' });
		return;
	}
	const newMealArray: Array<TPiniaDateMeal> = [];
	const filteredTypes = new Set<TMealType>();
	const filteredCategories = new Set<TCategory>();

	for (const item of mealsModule().meals) {
		if (item.da >= startDate.value && item.da <= endDate.value) {
			newMealArray.push(item);
			if (item.D?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
			if (item.J?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
			if (item.J?.r || item.D?.r) filteredTypes.add('restaurant');
			if (item.J?.t || item.D?.t) filteredTypes.add('takeout');
			if (item.J?.v || item.D?.v) filteredTypes.add('vegetarian');
		}
	}
	mealsModule().set_meals(newMealArray);
	typesModule().set_types([ ...filteredTypes ]);
	categoriesModule().set_categories([ ...filteredCategories ]);
	original.value = false;
};
</script>