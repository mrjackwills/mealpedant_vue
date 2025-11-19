<template>
	<v-data-table-virtual
		id='meal_table'
		ref='table'
		density='compact'
		fixed-header
		:headers
		:height='tableHeight'
		hover
		item-value='date'
		:items='tableData'
		no-data-text='no meals'
	>
		<template v-if='!authenticated && showInfo' #top='{ }'>
			<v-row ref='infobar' align='center' class='bg-infobar ma-0 pa-0 fill-height unselectable' justify='center'>
				<v-col class='ma-0 pa-0 text-center' cols='1' md='auto'>
					<v-icon :icon='mdiInformation' :size='smAndDown?"x-small":"small"' />
				</v-col>
				<v-col class='ma-0 pa-0 px-2 text-center' :class='{ "smalltext": smAndDown }' cols='10' md='auto'>
					Access to both datasets requires registration
				</v-col>
				<v-col class='ma-0 pa-0 cl text-center' cols='1' md='auto' @click='showInfo=false'>
					<v-icon :icon='mdiClose' :size='smAndDown?"x-small":"small"' />
				</v-col>
			</v-row>
		</template>

		<template #headers='{ columns, isSorted, getSortIcon, toggleSort }'>
			<tr v-if='tableData.length > 0' class='header_bg' style='height:10px!important'>
				<template v-for='column in columns' :key='column.key'>
					<td
						class='unselectable ma-0 pa-0'
						:class='{ "cl": column.sortable }'
						@click='() => toggleSort(column)'
					>
						<span class='pl-4' :class='headerClass(column.title)'>{{ column.title }}</span>
						<v-icon
							v-if='column.sortable'
							color='offwhite'
							:icon='isSorted(column) ? getSortIcon(column) : mdiSwapVertical'
							size='x-small'
						/>
						<v-divider />
					</td>
				</template>
			</tr>
		</template>

		<template #[`item.date`]='{ item }'>
			<v-row v-intersect='(entries: boolean) => onIntersect(entries, item.date)' align='start' class='no-gutters ma-0 pa-0 text-red-lighten-4 py-2' justify='start'>
				<v-col class='pa-0 ma-0 ml-1' :class='computedDateFont' cols='12'>
					{{ filteredDay(item.date) }}
				</v-col>
				<v-col class='pa-0 ma-0 ml-1' :class='computedDateFont' cols='12'>
					{{ filteredDate(item.date) }}
				</v-col>
				<v-col class='pa-0 ma-0 ml-1' :class='computedDateFont' cols='12'>
					{{ filteredYear(item.date) }}
				</v-col>
				<v-col class='pa-0 ma-0 ml-1' :class='computedDateFont' cols='12'>
					day: {{ filteredDayNumber(item.date) }}
				</v-col>
			</v-row>
		</template>

		<template #[`item.Dave`]='{ item }'>

			<MealDescription
				v-if='item.Dave'
				:key='`d-${item.date}`'
				:date='item.date'
				:meal-category-id='item.Dave.meal_category_id'
				:meal-description-id='item.Dave.meal_description_id'
				:person='TPerson.DAVE'
				:photo='item.Dave.photo'
				:restaurant='item.Dave.restaurant == 1'
				:takeaway='item.Dave.takeaway == 1'
				:vegetarian='item.Dave.vegetarian == 1'
			/>
		</template>
		<template v-if='show_jack' #[`item.Jack`]='{ item }'>
			<MealDescription
				v-if='item.Jack'
				:key='`j-${item.date}`'
				:date='item.date'
				:meal-category-id='item.Jack.meal_category_id'
				:meal-description-id='item.Jack.meal_description_id'
				:person='TPerson.JACK'
				:photo='item.Jack.photo'
				:restaurant='item.Jack.restaurant == 1'
				:takeaway='item.Jack.takeaway == 1'
				:vegetarian='item.Jack.vegetarian == 1'
			/>
		</template>

		<template #no-data>
			<v-row class='' justify='center'>
				<v-col class='text-center mt-4' cols='12'>
					<span class='text-white'>No meals found with current filters</span>
				</v-col>

				<v-col class='text-center mb-4' cols='12'>
					<ClearFilterButton />
				</v-col>

			</v-row>
		</template>

		<template #bottom>
			<v-row align='center' class='ma-0 pa-0 my-2 mx-4' :class='{ "smalltext": smAndDown }' justify='space-around'>

				<v-col class='ma-0 pa-0' cols='5'>
					<span>total: </span>
					<span v-tooltip:top='"total number days"' class='text-mealtype font-weight-bold'>{{ totalMeals }} </span>
				</v-col>

				<v-col class='ma-0 pa-0 text-center' cols='2'>
					<v-row align='center' class='ma-0 pa-0 no-gutters' justify='space-around'>

						<v-col class='ma-0 pa-0 text-center' cols='auto'>
							<v-chip
								v-tooltip:top='"scroll start"'
								color='mealtype'
								density='compact'
								:disabled='scroll_up_disabled'
								:size='smAndDown?"x-small":"small"'
								@click='scrollTableStart'
							>
								<v-icon color='mealtype' :icon='mdiArrowCollapseUp' :size='smAndDown?"x-small":"small"' />
							</v-chip>
						</v-col>

						<v-col class='ma-0 pa-0 text-center' cols='auto'>
							<v-chip
								v-tooltip:top='"scroll end"'
								color='mealtype'
								density='compact'
								:disabled='scroll_down_disabled'
								:size='smAndDown?"x-small":"small"'
								@click='scrollTableEnd'
							>
								<v-icon color='mealtype' :icon='mdiArrowCollapseDown' :size='smAndDown?"x-small":"small"' />
							</v-chip>
						</v-col>
					</v-row>
				</v-col>

				<v-col class='ma-0 pa-0 text-end' cols='5'>

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
import { mdiArrowCollapseDown, mdiArrowCollapseUp, mdiClose, mdiInformation, mdiSwapVertical } from '@mdi/js'
import { useDisplay, useLayout } from 'vuetify'
import { VRow } from 'vuetify/components'
import { type DateMeal, TPerson } from '@/types'
import { days, genesisDate, months } from '@/vanillaTS/globalConst'
const { smAndDown, mdAndDown } = useDisplay()
const mealStore = mealModule()

const { getLayoutItem } = useLayout()

const showInfo = computed({
	get (): boolean {
		return mealViewModule().showInfo
	},
	set (b: boolean): void {
		mealViewModule().set_showInfo(b)
	},
})

const first_date = computed(() => tableData.value[0]?.date)
const last_date = computed(() => tableData.value.at(-1)?.date)

const scroll_up_disabled = ref(false)
const scroll_down_disabled = ref(false)

function onIntersect (visible: boolean, date: string): void {
	if (first_date.value === date) scroll_up_disabled.value = visible
	if (last_date.value === date) scroll_down_disabled.value = visible
}

const table = ref()

function scrollTableStart (): void {
	scroll_up_disabled.value = true
	scroll_down_disabled.value = false
	table.value.scrollToIndex(0)
}

function scrollTableEnd (): void {
	scroll_down_disabled.value = true
	scroll_up_disabled.value = false
	table.value.scrollToIndex(tableData.value.length - 1)
	setTimeout(() => table.value.scrollToIndex(tableData.value.length - 1), 1)
}

const b64 = computed(() => mealStore.filter_b64)
watch(b64, () => {
	scrollTableStart()
})

const footer_height = (): number => getLayoutItem('footer')?.size ?? 0
const header_height = (): number => getLayoutItem('header')?.size ?? 0

const has_filter = computed(() => mealStore.is_filtered)

const size = computed(() => mealViewModule().tableHeight)

const tableHeight = computed(() => `${size.value}px`)

const props = defineProps<{ slotHeight: number }>()

watch(() => props.slotHeight, () => {
	calc_table_height()
})

const infobar = ref(null as null | VRow)
const infobar_height = ref(0)

onMounted(() => {
	if (infobar.value) infobar_height.value = infobar.value.$el.clientHeight
})

// / Calculate the table height based on inner window height, table location, and footer size
function calc_table_height (): void {
	const suffix = 1.35
	const new_size = window.innerHeight - props.slotHeight - footer_height() * suffix - header_height() * suffix - infobar_height.value
	if (new_size > size.value) mealViewModule().set_table_height(new_size)
}

const computedDateFont = computed(() => mdAndDown.value ? 'smallesttext' : 'smalltext')
const headerClass = (x: string | undefined): string => x === TPerson.DAVE ? 'dave-header' : (x === TPerson.JACK ? 'jack-header' : '')

const totalMeals = computed(() => mealStore.date_meals.length)
const filteredDays = computed(() => mealStore.filtered_date_meals.length)

const authenticated = computed(() => userModule().authenticated)
const headers = computed(() => {
	const headers = []
	headers.push({
		align: 'start' as const,
		class: '',
		sortable: true,
		title: 'Date',
		key: 'date',
		width: '10%',
	})
	if (show_dave.value) headers.push({
		align: 'start' as const,
		class: 'dave-header',
		sortable: false,
		title: TPerson.DAVE,
		key: TPerson.DAVE,
		width: show_jack.value ? '45%' : '90%',

	})

	if (show_jack.value) headers.push({
		align: 'start' as const,
		class: 'jack-header',
		sortable: false,
		title: TPerson.JACK,
		key: TPerson.JACK,
		width: show_dave.value ? '45%' : '90%',
	})
	return headers
})

const show_dave = computed(() => mealStore.show_dave)
const show_jack = computed(() => mealStore.show_jack)
const tableData = computed((): Array<DateMeal> => mealStore.get_meals.date_meals)

function filteredDate (a: string): string {
	const mealDate = new Date(a)
	return `${mealDate.getUTCDate()} ${months[mealDate.getUTCMonth()]}`
}

const filteredDay = (a: string): string => `${days[new Date(a).getUTCDay()]}`
function filteredDayNumber (a: string): number {
	const end = new Date(a).getTime()
	return Math.ceil((end - genesisDate) / 1000 / 60 / 60 / 24) + 1
}
const filteredYear = (a: string): string => String(new Date(a).getUTCFullYear())

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
