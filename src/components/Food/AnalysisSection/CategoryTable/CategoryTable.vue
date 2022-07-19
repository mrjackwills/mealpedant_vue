<template>
	<v-row justify='center' class='my-0'>
		<v-col cols='12' md='auto' id='headers' class=''>
			<v-data-table
				:footer-props='footerProps'
				:headers='analysisHeaders'
				:items='tableData'
				:mobile-breakpoint='0'
				class='elevation-1'

				item-key='name'
				dense
				must-sort
			>
				<template v-slot:item='{ item }'>
					<tr>
						<td>
							{{ item.category_name }}
						</td>
						<td class='text-left text-caption' >
							<v-row align='center' justify='end' class='no-gutters ma-0 pa-0'>
								<v-spacer />
								<v-col cols='auto' class='ma-0 pa-0 mealtype--text text-right'>
									<v-row class='no-gutters mealtype--text' align='center' :class='{"smalltext": $vuetify.breakpoint.mdAndDown}'>
										<v-col cols='auto' class='ma-0 pa-0'>
											<div class=''>
												{{ item.t }}
											</div>
										</v-col>
										<v-spacer />
										<v-col cols='auto' class='ml-2 text-right ma-0 pa-0'>
											<div class=''>
												({{ (100 / (filtered_total) * item.t).toFixed(2) }}%)
											</div>
										</v-col>
									</v-row>
								</v-col>
								<v-col cols='6' class='ma-0 pa-0'>
									<v-row class='no-gutters ma-0 pa-0 text-right'>
										<v-col cols='12' class='ma-0 pa-0'>
											<span
												class='font-weight-thin primary--text'
												:class='[{"smalltext": $vuetify.breakpoint.mdAndDown}, {"np" : !Dave}]'
											>
												Dave: {{ item.d }} ({{ (100 / (item.t) * item.d).toFixed(2) }}%)
												<span class='smallesttest' v-if='filtered_total !== originalLength && Jack && Dave'>
													({{ (100 / (originalLength) * item.d).toFixed(2) }}%)
												</span>
											</span>
										</v-col>
										<v-col cols='12' class='ma-0 pa-0'>
											<span
												class='font-weight-thin secondary--text'
												:class='[{"smalltext": $vuetify.breakpoint.mdAndDown}, {"np" : !Jack}]'
											>
												Jack: {{ item.j }} ({{ (100 / (item.t) * item.j).toFixed(2) }}%)
												<span class='smallesttest' v-if='filtered_total !== originalLength && Jack && Dave'>
													({{ (100 / (originalLength) * item.j).toFixed(2) }}%)
												</span>
											</span>
										</v-col>
									</v-row>
								</v-col>
							</v-row>
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { dexieDB } from '@/services/dexieDB';
import { categoriesModule, foodModule, mealsModule } from '@/store';
import { TCategory, TCategoryTableDate, TPiniaDateMeal, TFooterProps } from '@/types';
import Vue from 'vue';
export default Vue.extend({
	name: 'category-table-component',

	async beforeMount () {
		this.originalLength = await dexieDB.original_number_meals();
	},

	computed: {
		Jack (): boolean {
			return foodModule().Jack;
		},
		Dave (): boolean {
			return foodModule().Dave;
		},
		meals (): Array<TPiniaDateMeal> {
			return mealsModule().meals;
		},
		filtered_total (): number {
			let total = 0;
			for (const day of this.meals) {
				if (day.D) total ++;
				if (day.J) total ++;
			}
			return total > this.originalLength ? this.originalLength : total;
		},
		categories (): Array<TCategory> {
			return categoriesModule().categories;
		},
		footerProps (): TFooterProps {
			return {
				itemsPerPageOptions: [ 10, 20, 30, -1 ],
				itemsPerPageText: this.$vuetify.breakpoint.mdAndUp ? 'categories' : 'categories',
			};
		},

		tableData (): Array<TCategoryTableDate> {
			const data = [] ;
			for (const day of this.meals) {
				if (day.J?.c) {
					const dataIndex = data.findIndex((item) => item.category_name === day.J?.c);
					if (dataIndex < 0) data.push({ category_name: day.J.c, j: 1, d: 0, t: 1 });
					else {
						const x = data[dataIndex];
						if (x) {
							x.j ++;
							x.t ++;
						}
					}
				}
				if (day.D?.c) {
					const dataIndex = data.findIndex((item) => item.category_name === day.D?.c);
					if (dataIndex < 0) data.push({ category_name: day.D.c, j: 0, d: 1, t: 1 });
					else {
						const x = data[dataIndex];
						if (x) {
							x.d ++;
							x.t ++;
						}
					}
				}
			}
			return data.sort((a, b) => b.t - a.t);
		}
	},

	data: () => ({
		originalLength: 0,
		analysisHeaders: [
			{
				align: 'left',
				sortable: true,
				text: 'Category',
				value: 'category_name'
			},
			{
				align: 'center',
				sortable: true,
				text: 'Quantity',
				value: 't',
			},
		],
		expanded: [],
		spanFields: [
			'D', 'J'
		],
		totalItems: 0,
	}),
});
</script>