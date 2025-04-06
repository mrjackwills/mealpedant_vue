<template>
	<v-data-table-virtual
		:headers='headers'
		:height='tableHeight'
		:items='tableData'
		density='compact'
		id='meal_table'
		item-value='date'
		no-data-text='no meals'
		ref='table'
		fixed-header
		hover
	>
		<template v-if='!authenticated && showInfo' v-slot:top='{ }'>
			<v-row justify='center' class='bg-infobar ma-0 pa-0 fill-height unselectable' align='center' ref='infobar'>
				<v-col cols='1' md='auto' class='ma-0 pa-0 text-center'>
					<v-icon :size='smAndDown?"x-small":"small"' :icon='mdiInformation' />
				</v-col>
				<v-col cols='10'  md='auto' class='ma-0 pa-0 px-2 text-center' :class='{ "smalltext": smAndDown }'>
					Access to both datasets requires registration 
				</v-col>
				<v-col cols='1'  md='auto' class='ma-0 pa-0 cl text-center' @click='showInfo=false'>
					<v-icon :size='smAndDown?"x-small":"small"' :icon='mdiClose' />
				</v-col>
			</v-row>
		</template>

		<template v-slot:headers='{ columns, isSorted, getSortIcon, toggleSort }'>
			<tr class='header_bg' style='height:10px!important' v-if='tableData.length > 0'>
				<template v-for='column in columns' :key='column.key'>
					<td class='unselectable ma-0 pa-0' :class='{ "cl": column.sortable }'
						@click='() => toggleSort(column)'>
						<span :class='headerClass(column.title)' class='pl-4'>{{ column.title }}</span>
						<v-icon v-if='column.sortable' :icon='isSorted(column) ? getSortIcon(column) : mdiSwapVertical'
							color='offwhite' size='x-small' />
						<v-divider />
					</td>
				</template>
			</tr>
		</template>

		<template v-slot:[`item.date`]='{ item }'>
			<v-row align='start' justify='start' class='no-gutters ma-0 pa-0 text-red-lighten-4 py-2'  v-intersect='(entries: boolean) => onIntersect(entries, item.date)'>
				<v-col cols='12' class='pa-0 ma-0 ml-1' :class='computedDateFont'>
					{{ filteredDay(item.date) }}
				</v-col>
				<v-col cols='12' class='pa-0 ma-0 ml-1' :class='computedDateFont'>
					{{ filteredDate(item.date) }}
				</v-col>
				<v-col cols='12' class='pa-0 ma-0 ml-1' :class='computedDateFont'>
					{{ filteredYear(item.date) }}
				</v-col>
				<v-col cols='12' class='pa-0 ma-0 ml-1' :class='computedDateFont'>
					day: {{ filteredDayNumber(item.date) }}
				</v-col>
			</v-row>
		</template>

		<template v-slot:[`item.Dave`]='{ item }'>

			<MealDescription v-if='item.Dave' :meal_category_id='item.Dave.meal_category_id' :date='item.date'
				:meal_description_id='item.Dave.meal_description_id' :key='`d-${item.date}`' :photo='item.Dave.photo'
				:restaurant='item.Dave.restaurant == 1' :takeaway='item.Dave.takeaway == 1'
				:vegetarian='item.Dave.vegetarian == 1' person='Dave' />
		</template>
		<template v-if='show_jack' v-slot:[`item.Jack`]='{ item }'>
			<MealDescription v-if='item.Jack' :meal_category_id='item.Jack.meal_category_id' :date='item.date'
				:meal_description_id='item.Jack.meal_description_id' :key='`j-${item.date}`' :photo='item.Jack.photo'
				:restaurant='item.Jack.restaurant == 1' :takeaway='item.Jack.takeaway == 1'
				:vegetarian='item.Jack.vegetarian == 1' person='Jack' />
		</template>

		<template v-slot:no-data>
			<v-row class='' justify='center'>
				<v-col cols='12' class='text-center mt-4'>
					<span class='text-white'>No meals found with current filters</span>
				</v-col>

				<v-col cols='12' class='text-center mb-4'>
					<ClearFilterButton />
				</v-col>

			</v-row>
		</template>

		<template v-slot:bottom>
			<v-row class='ma-0 pa-0 my-2 mx-4' justify='space-around' align='center' :class='{ "smalltext": smAndDown }'>

				<v-col cols='5' class='ma-0 pa-0' >
					<span>total: </span>
					<span class='text-mealtype font-weight-bold' v-tooltip:top='"total number days"'>{{ totalMeals }} </span>
				</v-col>

				<v-col cols='2' class='ma-0 pa-0 text-center' >
					<v-row class='ma-0 pa-0 no-gutters' align='center' justify='space-around'>

						<v-col cols='auto' class='ma-0 pa-0 text-center'>
							<v-chip color='mealtype' @click='scrollTableStart' density='compact' :size='smAndDown?"x-small":"small"' :disabled='scroll_up_disabled' v-tooltip:top='"scroll start"'>
								<v-icon :icon='mdiArrowCollapseUp' color='mealtype' :size='smAndDown?"x-small":"small"'/>
							</v-chip>
						</v-col>
							
						<v-col cols='auto' class='ma-0 pa-0 text-center'>
							<v-chip color='mealtype' @click='scrollTableEnd' density='compact' :size='smAndDown?"x-small":"small"' :disabled='scroll_down_disabled' v-tooltip:top='"scroll end"'>
								<v-icon :icon='mdiArrowCollapseDown' color='mealtype' :size='smAndDown?"x-small":"small"' />
							</v-chip>
						</v-col> 
					</v-row>
				</v-col>

				<v-col cols='5' class='ma-0 pa-0 text-end'>
				
					<section v-if='has_filter'>
						filtered:
						<span class='font-weight-bold text-mealtype'>{{ filteredDays }}</span>
						<span v-tooltip:top='"% all days"' class='font-italic text-mealtype'>
							({{ (100 / (totalMeals) * filteredDays).toFixed(2) }}%)
						</span>
					</section>
				</v-col>
			</v-row>
		</template>

	</v-data-table-virtual> 

</template>

<script setup lang='ts'>
import { genesisDate, months, days } from '@/vanillaTS/globalConst';
import { useDisplay, useLayout } from 'vuetify';
import { DateMeal } from '@/types';
import { mdiArrowCollapseUp, mdiSwapVertical, mdiInformation, mdiClose, mdiArrowCollapseDown } from '@mdi/js';
import { VRow } from 'vuetify/components';
const { smAndDown, mdAndDown } = useDisplay();
const mealStore = mealModule();

const { getLayoutItem } = useLayout();

const showInfo = computed({
	get (): boolean {
		return mealViewModule().showInfo;
	},
	set (b: boolean): void {
		mealViewModule().set_showInfo(b);
	}
});

const first_date = computed(() => tableData.value[0]?.date);
const last_date = computed(() => tableData.value[tableData.value.length - 1]?.date);

const scroll_up_disabled = ref(false);
const scroll_down_disabled = ref(false);

const onIntersect = (visible: boolean, date: string): void => {
	if (first_date.value === date) scroll_up_disabled.value = visible;
	if (last_date.value === date) scroll_down_disabled.value = visible;
};

const table = ref();

const scrollTableStart = (): void => {
	scroll_up_disabled.value = true;
	scroll_down_disabled.value = false;
	table.value.scrollToIndex(0);
};

const scrollTableEnd = (): void => {
	scroll_down_disabled.value = true;
	scroll_up_disabled.value = false;
	table.value.scrollToIndex(tableData.value.length - 1);
	setTimeout(
		() => table.value.scrollToIndex(tableData.value.length - 1),
		1
	);
};

const b64 = computed(() => mealStore.filter_b64);
watch(b64, (_) => {
	scrollTableStart();
});

const footer_height = (): number => getLayoutItem('footer')?.size ?? 0;
const header_height = (): number => getLayoutItem('header')?.size ?? 0;

const has_filter = computed(() => mealStore.is_filtered);

const size = computed(() => mealViewModule().tableHeight);

const tableHeight = computed(() => `${size.value}px`);

const props = defineProps<{ slot_height: number }>();

watch(()=> props.slot_height, (_) => {
	calc_table_height();
});

const infobar = ref(null as null | VRow );
const infobar_height = ref(0);

onMounted(() => {
	if (infobar.value) infobar_height.value = infobar.value.$el.clientHeight;
});

/// Calculate the table height based on inner window height, table location, and footer size
const calc_table_height = (): void => {
	const suffix = 1.35;
	const new_size = window.innerHeight - props.slot_height - footer_height() * suffix - header_height() * suffix - infobar_height.value;
	if (new_size > size.value) mealViewModule().set_table_height(new_size);
};

const computedDateFont = computed(() => mdAndDown.value ? 'smallesttext' : 'smalltext');
const headerClass = (x: string | undefined): string => x === 'Dave' ? 'dave-header' : x === 'Jack' ? 'jack-header' : '';

const totalMeals = computed(() => mealStore.date_meals.length);
const filteredDays = computed(() => mealStore.filtered_date_meals.length);

const authenticated = computed(() => userModule().authenticated);
const headers = computed(() => {
	const headers = [];
	headers.push(
		{
			align: 'start' as const,
			class: '',
			sortable: true,
			title: 'Date',
			key: 'date',
			width: '10%'
		}
	);
	if (show_dave.value) headers.push(
		{
			align: 'start' as const,
			class: 'dave-header',
			sortable: false,
			title: 'Dave',
			key: 'Dave',
			width: show_jack.value ? '45%' : '90%'

		}
	);

	if (show_jack.value) headers.push(
		{
			align: 'start' as const,
			class: 'jack-header',
			sortable: false,
			title: 'Jack',
			key: 'Jack',
			width: show_dave.value ? '45%' : '90%'
		}
	);
	return headers;
});

const show_dave = computed(() => mealStore.show_dave);
const show_jack = computed(() => mealStore.show_jack);
const tableData = computed((): Array<DateMeal> => mealStore.get_meals.date_meals);

const filteredDate = (a: string): string => {
	const mealDate = new Date(a);
	return `${mealDate.getUTCDate()} ${months[mealDate.getUTCMonth()]}`;
};

const filteredDay = (a: string): string => `${days[new Date(a).getUTCDay()]}`;
const filteredDayNumber = (a: string): number => {
	const end = new Date(a).getTime();
	return Math.ceil((end - genesisDate) / 1000 / 60 / 60 / 24) + 1;
};
const filteredYear = (a: string): string => String(new Date(a).getUTCFullYear());

</script>

<style>
td {
	vertical-align: top;
}

.header_bg {
	background-color: #212121;
	/* font-size: 1rem */
}

/* Headers for the data table, probably excessive selector */
#meal_table .v-table > .v-table__wrapper > table > tbody > tr > td, .v-table > .v-table__wrapper > table > thead > tr > td, .v-table > .v-table__wrapper > table > tfoot > tr > td{
	height: 100%!important;
}
</style>
