<template>
	<v-data-table-virtual
		ref='table'
		:density
		fixed-header
		:headers
		:height
		hide-default-footer
		hover
		item-key='name'
		:items='tableData'
		no-data-text=''
	>

		<template #[`item.category_name`]='{ item }'>
			<v-row
				align='center'
				class='ma-0 pa-0 text-red-lighten-4 fill-height'
				:class='[{ "smalltext": smAndDown }, {"my-1": rowPadding}]'
				justify='start'
			>
				<v-col class='ma-0 pa-0' cols='auto'>
					{{ formatCategoryName(item.category_name) }}
				</v-col>
			</v-row>
		</template>

		<template #[`item.t`]='{ item }'>
			<v-row
				v-intersect='(entries: boolean) => onIntersect(entries, item.category_id)'
				align='center'
				class='ma-0 pa-0 fill-height'
				:class='[{ "smalltext": smAndDown }, {"my-1": rowPadding}]'
				:justify='authenticated ? show_jack && show_dave ? "start" : "end" : "end"'
			>

				<v-col
					v-if='authenticated'
					class='ma-0 pa-0'
					:class='show_jack && show_dave ? "text-mealtype" : show_jack && !show_dave ? "text-secondary" : "text-primary"'
					cols='6'
				>

					<v-row align='center' class='ma-0 pa-0' justify='space-around'>
						<v-col class='ma-0 pa-0 font-weight-bol mono-num' cols='6'>
							{{ item.t }}
						</v-col>
						<v-col
							v-tooltip:top='has_filter ? "% filtered meals" : "% all meals"'
							class='ma-0 pa-0 font-italic mono-num'
							cols='6'
						>
							{{ (100 / (total_meals) * item.t).toFixed(2) }}%
						</v-col>
					</v-row>

				</v-col>

				<v-col
					v-if='authenticated ? show_dave && show_jack : true'
					class='ma-0 pa-0'
					:cols='authenticated ? "6" : "8"'
				>

					<v-row align='center' class='ma-0 pa-0 ' justify='center'>
						<v-col v-if='authenticated' class='ma-0 pa-0 text-primary' cols='12'>
							<v-row align='center' class='ma-0 pa-0' justify='space-around'>
								<v-col class='ma-0 pa-0 font-weight-bold text-right mono-num'>
									{{ item.d }}
								</v-col>

								<v-col v-tooltip:top='"% split"' class='ma-0 pa-0 font-italic mono-num'>
									<span>{{ (100 / (item.t) *
										item.d).toFixed(2) }}% </span>
								</v-col>
							</v-row>
						</v-col>
						<v-col class='ma-0 pa-0 text-secondary' cols='12'>
							<v-row align='center' class='ma-0 pa-0' justify='space-around'>
								<v-col class='ma-0 pa-0 font-weight-bold text-right mono-num'>
									{{ item.j }}
								</v-col>

								<v-col
									v-tooltip:top='authenticated ? "% split" : "% all meals"'
									class='ma-0 pa-0 font-italic mono-num'
								>
									<span v-if='authenticated'>
										{{ (100 / (item.t) *
											item.j).toFixed(2) }}% </span>
									<span v-else>
										{{ (100 / (originalLength) * item.j).toFixed(2) }}%
									</span>
								</v-col>
							</v-row>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</template>
		<template v-if='tableData.length > 0' #bottom='{ }'>
			<v-row
				align='center'
				class='ma-0 pa-0 py-1 px-4 '
				:class='{ "smalltext": smAndDown }'
				justify='space-around'
			>

				<v-col class='ma-0 pa-0 text-start' cols='5'>
					total:
					<span class='text-mealtype font-weight-bold mono-num'>{{ total_categories }}</span>
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
						<span class='font-weight-bold text-mealtype mono-num'>{{ tableData.length }}</span>
						<span v-tooltip:top='"% all categories"' class='font-italic text-mealtype mono-num'>
							({{ (100 / (total_categories) * tableData.length).toFixed(2) }}%)
						</span>
					</section>
				</v-col>
			</v-row>
		</template>

	</v-data-table-virtual>
</template>

<script setup lang='ts'>
import type { TCategoryTableDate } from '@/types'
import { mdiArrowCollapseDown, mdiArrowCollapseUp } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { formatCategoryName } from '@/vanillaTS/helpers'

const { smAndDown, platform } = useDisplay()

const table = ref()
const scroll_up_disabled = ref(false)
const scroll_down_disabled = ref(false)
const density = computed(() => authenticated.value ? (platform.value.firefox ? 'compact' : 'comfortable') : 'compact')
const rowPadding = computed(() => authenticated.value ? (platform.value.firefox ? true : false) : true)
const first_id = computed(() => tableData.value[0]?.category_id)
const last_id = computed(() => tableData.value.at(-1)?.category_id)

function onIntersect (visible: boolean, category_id: number): void {
	if (first_id.value === category_id) scroll_up_disabled.value = visible
	if (last_id.value === category_id) scroll_down_disabled.value = visible
}

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

const mealStore = mealModule()
const height = computed((): string => {
	if (tableData.value.length === 0) return ''
	return '200'
})

const authenticated = computed(() => userModule().authenticated)
const total_meals = computed(() => mealStore.get_total_meals_visible())
const has_filter = computed(() => mealStore.is_filtered)
const show_dave = computed(() => mealStore.show_dave)
const show_jack = computed(() => mealStore.show_jack)
const total_categories = computed(() => mealStore.meal_categories.size)

const b64 = computed(() => mealStore.filter_b64)
watch(b64, () => {
	scrollTableStart()
})

const tableData = computed((): Array<TCategoryTableDate> => {
	const data = new Map<number, TCategoryTableDate>()

	for (const i of mealStore.get_meals.meal_categories) {
		data.set(i[0], {
			category_name: i[1],
			category_id: i[0],
			t: 0,
			j: 0,
			d: 0,
		})
	}
	for (const day of mealStore.get_meals.date_meals) {
		if (day.Dave) {
			const exists = data.get(day.Dave.meal_category_id)
			if (exists) {
				exists.d += 1
				exists.t += 1
			}
		}
		if (day.Jack) {
			const exists = data.get(day.Jack.meal_category_id)
			if (exists) {
				exists.j += 1
				exists.t += 1
			}
		}
	}
	return Array.from(data.values()).toSorted((a, b) => b.t - a.t)
})

const originalLength = computed(() => mealStore.date_meals.length)

const headers = [
	{
		title: 'Category',
		align: 'start',
		key: 'category_name',
		sortable: false,
		width: '20%',
	},
	{
		title: 'Quantity',
		key: 't',
		align: 'end',
		sortable: false,
		width: '80%',
	},
] as const

</script>

<style>
th{
	height: 50%!important;
}
</style>
