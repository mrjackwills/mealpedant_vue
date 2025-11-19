<template>
	<v-data-table-virtual
		:density
		:headers
		hide-default-footer
		hover
		item-key='name'
		:items='tableData'
		no-data-text=''
	>

		<template #[`item.v`]='{ item }'>
			<v-row align='center' class='ma-0 pa-0 text-red-lighten-4 fill-height' :class='{ "smalltext": smAndDown }' justify='start'>
				<v-col class='ma-0 pa-0' cols='auto'>
					{{ formatCategoryName(item.variant) }}
				</v-col>
			</v-row>
		</template>

		<template #[`item.q`]='{ item }'>

			<v-row align='center' class='ma-0 pa-0 fill-height' :class='{ "smalltext": smAndDown }' :justify='authenticated?show_jack && show_dave?"start":"end":"end"'>

				<v-col v-if='authenticated' class='ma-0 pa-0' :class='show_jack && show_dave? "text-mealtype" : show_jack &&!show_dave?"text-secondary":"text-primary"' cols='6'>
					<v-row align='center' class='ma-0 pa-0' justify='space-around'>
						<v-col class='ma-0 pa-0 font-weight-bold mono-num' cols='6'>
							{{ item.q.Dave + item.q.Jack }}
						</v-col>
						<v-col class='ma-0 pa-0 font-italic mono-num' cols='6'>
							<span v-tooltip:top='has_filter ? "% filtered meals" : "% all meals"'>
								{{ (100 / (total_meals_visible) * (item.q.Dave + item.q.Jack)).toFixed(2) }}%
							</span>
						</v-col>
					</v-row>
				</v-col>

				<v-col v-if='authenticated? show_dave&&show_jack : true' class='ma-0 pa-0' :cols='authenticated? "6":"8"'>
					<v-row align='center' class='ma-0 pa-0' justify='center'>
						<v-col v-if='authenticated' class='ma-0 pa-0 text-primary' cols='12'>
							<v-row align='center' class='ma-0 pa-0' justify='space-around'>
								<v-col class='ma-0 pa-0 font-weight-bold text-right mono-num'>
									{{ item.q.Dave }}
								</v-col>
								<v-col
									v-tooltip:top='"% split"'
									class='ma-0 pa-0 font-italic mono-num'
								>
									{{ (item.q.Dave !== 0) ? ((100 / (item.q.Dave + item.q.Jack) * item.q.Dave).toFixed(2)) : '0.00' }}%
								</v-col>
							</v-row>
						</v-col>

						<v-col class='ma-0 pa-0 text-secondary' cols='12'>
							<v-row align='center' class='ma-0 pa-0' justify='space-around'>
								<v-col class='ma-0 pa-0 font-weight-bold text-right mono-num'>
									{{ item.q.Jack }}
								</v-col>
								<v-col
									v-tooltip:top='authenticated ? "% split" : "% all meals"'
									class='ma-0 pa-0 font-italic mono-num'
								>
									<span v-if='authenticated'>
										{{ (item.q.Jack !== 0) ? ((100 / (item.q.Dave + item.q.Jack) * item.q.Jack).toFixed(2)) : '0.00' }}%
									</span>
									<span v-else>
										{{ (100 / (total_meals) * item.q.Jack).toFixed(2) }}%
									</span>
								</v-col>
							</v-row>
						</v-col>

					</v-row>
				</v-col>

			</v-row>
		</template>

	</v-data-table-virtual>
</template>

<script setup lang='ts'>
import type { TCategoryTotals } from '@/types'
import { useDisplay } from 'vuetify'
import { formatCategoryName } from '@/vanillaTS/helpers'

const { smAndDown, platform } = useDisplay()
const mealStore = mealModule()
const authenticated = computed(() => userModule().authenticated)
const total_meals = computed(() => mealStore.get_total_meals())
const total_meals_visible = computed(() => mealStore.get_total_meals_visible())
const density = computed(() => platform.value.firefox ? 'comfortable' : 'compact')

const has_filter = computed(() => mealStore.is_filtered)

const headers = [
	{
		title: 'Variant',
		align: 'start',
		key: 'v',
		sortable: false,
		width: '20%',
	},
	{
		title: 'Quantity',
		key: 'q',
		align: 'end',
		sortable: false,
		width: '80%',
	},
] as const

function default_totals (): TCategoryTotals {
	return [
		{
			variant: 'restaurant',
			q: {
				Dave: 0,
				Jack: 0,
			},
		},
		{
			variant: 'takeaway',
			q: {
				Dave: 0,
				Jack: 0,
			},
		},
		{
			variant: 'vegetarian',
			q: {
				Dave: 0,
				Jack: 0,
			},
		},
	]
}
const show_jack = computed(() => mealStore.show_jack)
const show_dave = computed(() => mealStore.show_dave)

const tableData = computed((): TCategoryTotals => {
	const totals = default_totals()
	for (const item of mealStore.get_meals.date_meals) {
		for (const person of ['Jack' as const, 'Dave' as const]) {
			for (const v of ['restaurant' as const, 'takeaway' as const, 'vegetarian' as const]) {
				if (item?.[person]?.[v]) {
					const totalsIndex = totals.findIndex(i => i.variant.toLowerCase().startsWith(v))
					const item = totals[totalsIndex]
					if (item) item.q[person]++
				}
			}
		}
	}
	return mealStore.get_meals.date_meals.length === 0 ? [] : totals
})
</script>

<style>
.np {
	text-decoration: line-through;
}

</style>
