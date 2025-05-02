<template>
	<v-data-table-virtual
		:density='density'
		:headers='headers'
		:items='tableData'
		item-key='name'
		no-data-text=''
		hide-default-footer
		hover
	>
	
		<template v-slot:[`item.v`]='{ item }'>
			<v-row justify='start' align='center' class='ma-0 pa-0 text-red-lighten-4 fill-height' :class='{ "smalltext": smAndDown }' >
				<v-col cols='auto' class='ma-0 pa-0'>
					{{ formatCategoryName(item.variant) }}
				</v-col>
			</v-row>
		</template>

		<template v-slot:[`item.q`]='{ item }'>

			<v-row align='center' class='ma-0 pa-0 fill-height' :justify='authenticated?show_jack && show_dave?"start":"end":"end"' :class='{ "smalltext": smAndDown }'>

				<v-col class='ma-0 pa-0' cols='6' v-if='authenticated' :class='show_jack && show_dave? "text-mealtype" : show_jack &&!show_dave?"text-secondary":"text-primary"'>
					<v-row align='center' justify='space-around' class='ma-0 pa-0'>
						<v-col cols='6' class='ma-0 pa-0 font-weight-bold mono-num'>
							{{ item.q.Dave + item.q.Jack }}
						</v-col>
						<v-col cols='6' class='ma-0 pa-0 font-italic mono-num'
							v-tooltip:top='has_filter ? "% filtered meals" : "% all meals"'>
							{{ (100 / (originalLength) * (item.q.Dave + item.q.Jack)).toFixed(2) }}% 
						</v-col>
					</v-row>
				</v-col>

				<v-col class='ma-0 pa-0' :cols='authenticated? "6":"8"' v-if='authenticated? show_dave&&show_jack : true'>
					<v-row align='center' class='ma-0 pa-0' justify='center'>
						<v-col class='ma-0 pa-0 text-primary' cols='12' v-if='authenticated'>
							<v-row align='center' justify='space-around' class='ma-0 pa-0'>
								<v-col class='ma-0 pa-0 font-weight-bold text-right mono-num'>
									{{ item.q.Dave }}
								</v-col>
								<v-col class='ma-0 pa-0 font-italic mono-num'
									v-tooltip:top='"% split"'>
									{{ (item.q.Dave !== 0) ? ((100 / (item.q.Dave + item.q.Jack) * item.q.Dave).toFixed(2)) : '0.00' }}%
								</v-col>
							</v-row>
						</v-col>

						<v-col class='ma-0 pa-0 text-secondary' cols='12'>
							<v-row align='center' justify='space-around' class='ma-0 pa-0'>
								<v-col class='ma-0 pa-0 font-weight-bold text-right mono-num'>
									{{ item.q.Jack }}
								</v-col>
								<v-col class='ma-0 pa-0 font-italic mono-num'
									v-tooltip:top='authenticated ? "% split" : "% all meals"'>
									<span v-if='authenticated'> 
										{{ (item.q.Jack !== 0) ? ((100 / (item.q.Dave + item.q.Jack) * item.q.Jack).toFixed(2)) : '0.00' }}%
									</span>
									<span v-else>
										{{ (100 / (originalLength) * item.q.Jack).toFixed(2) }}%
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
import type { TCategoryTotals } from '@/types';
import { useDisplay } from 'vuetify';
import { formatCategoryName } from '@/vanillaTS/helpers';

const { smAndDown, platform } = useDisplay();
const mealStore = mealModule();
const authenticated = computed(() => userModule().authenticated);
const originalLength = computed(() => mealStore.date_meals.length);
const density = computed(() => platform.value.firefox ? 'comfortable' : 'compact');

const has_filter = computed(() => mealStore.is_filtered);

const headers = [{
	title: 'Variant',
	align: 'start',
	key: 'v',
	sortable: false,
	width: '20%'
},
{
	title: 'Quantity',
	key: 'q',
	align: 'end',
	sortable: false,
	width: '80%'
}
] as const; 

const default_totals = (): TCategoryTotals => [
	{
		variant: 'restaurant',
		q: {
			Dave: 0,
			Jack: 0
		}
	},
	{
		variant: 'takeaway',
		q: {
			Dave: 0,
			Jack: 0
		}
	},
	{
		variant: 'vegetarian',
		q: {
			Dave: 0,
			Jack: 0
		}
	}
];
const show_jack = computed(() => mealStore.show_jack);
const show_dave = computed(() => mealStore.show_dave);

const tableData = computed((): TCategoryTotals => {
	const totals = default_totals();
	for (const item of mealStore.get_meals.date_meals) {
		for (const person of ['Jack' as const, 'Dave' as const]) {
			for (const v of ['restaurant' as const, 'takeaway' as const, 'vegetarian' as const]) {
				if (item?.[person]?.[v]) {
					const totalsIndex = totals.findIndex((i) => i.variant.toLowerCase().startsWith(v));
					const item = totals[totalsIndex];
					if (item) item.q[person]++;
				}
			}
		}
	}
	return mealStore.get_meals.date_meals.length === 0 ? [] : totals;
});
</script>

<style>
.np {
	text-decoration: line-through;
}

</style>