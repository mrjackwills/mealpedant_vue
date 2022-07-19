<template>
	<v-row justify='center' class=''>
		<v-col justify='center' cols='12' md='auto' class=''>
			<v-data-table
				:mobile-breakpoint='0'
				:headers='categoriesHeaders'
				:items='computedTypeItems'
				hide-default-footer
				must-sort
				item-key='name'
				class='elevation-1 ma-0 pa-0'
			>
				<template v-slot:item='{ item }'>
					<tr>
						<td >
							<span :class='{"smalltext": $vuetify.breakpoint.mdAndDown}'>{{ item.type }}</span>
						</td>
						<td>
							<v-row class='no-gutters mealtype--text ma-0 pa-0' align='center' :class='{"smalltext": $vuetify.breakpoint.mdAndDown}'>
								<v-col cols='auto' class='ma-0 pa-0'>
									<div class=''>
										{{ Number(item.D) + Number(item.J) }}
									</div>
								</v-col>
								<v-spacer />
								<v-col cols='auto' class='ml-2 text-right ma-0 pa-0'>
									<div class=''>
										({{ ((100 / totalMeals) * (Number(item.D) + Number(item.J))).toFixed(2) }}%)
										<br>
										<span v-if='filteredDays !== totalMeals' class='text-caption'>
											({{ ((100 / filteredDays) * (Number(item.D) + Number(item.J))).toFixed(2) }}%)
										</span>
									</div>
								</v-col>
							</v-row>
						</td>
						<td v-for='(name, index) in personArray' :key='index' :class='(index === 0) ? "primary--text" : "secondary--text"'>
							<v-row class='no-gutters ma-0 pa-0' align='center' :class='{"smalltext": $vuetify.breakpoint.mdAndDown}'>
								<v-col cols='auto' class='ma-0 pa-0'>
									<div class='' :class='strikeThroughMethod(name)'>
										{{ item[name] }}
									</div>
								</v-col>
								<v-spacer />
								<v-col cols='auto' class='ml-2 ma-0 pa-0 text-right'>
									<div class='' :class='strikeThroughMethod(name)'>
										({{ percentage(item.D, item.J, (index === 0) ) }})
										<br>
										<span v-if='filteredDays !== totalMeals' class='text-caption'>
											({{ ((100 / filteredDays) * (Number(item[name]))).toFixed(2) }}%)
										</span>
									</div>
								</v-col>
							</v-row>
						</td>
					</tr>
				</template>
				<template v-slot:[`body.append`]='{ }'>
					<tr>
						<td colspan='4'>
							<v-row justify='center' class='ma-0 pa-0'>
								<v-col cols='auto' class='ma-0 pa-0'>
									total days: {{ totalMeals }}
								</v-col>
							</v-row>
						</td>
					</tr>
					<tr v-if='filteredDays !== totalMeals'>
						<td colspan='4'>
							<v-row justify='center' class='ma-0 pa-0'>
								<v-col cols='auto' class='ma-0 pa-0'>
									filtered days: {{ filteredDays }} ({{ (100 / (totalMeals) * filteredDays).toFixed(2) }}%)
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
import { TCategoryTotals } from '@/types';
import { foodModule, mealsModule } from '@/store';
import Vue from 'vue';

export default Vue.extend({
	name: 'totals-table-component',
	async created () {
		this.totalMeals = await dexieDB.original_number_days();
	},
	data: () => ({
		totalMeals: 0,
		personArray: [ 'D' as const, 'J' as const ],
		categoriesHeaders: [
			{
				text: 'Type',
				align: 'center',
				value: 'type',
				sortable: false
			},
			{
				text: 'Total',
				align: 'center',
				sortable: false
			},
			{
				text: 'Dave',
				value: 'Dave',
				align: 'center',
				sortable: false,
			},
			{
				text: 'Jack',
				value: 'Jack',
				align: 'center',
				sortable: false,
			},
		],
	}),

	methods: {
		percentage (Dave: string, Jack: string, person: boolean): string {
			if (Number(Dave) + Number(Jack) === 0) return '0.00%';
			return `${(100 / (Number(Dave) + Number(Jack)) * Number(person ? Dave : Jack)).toFixed(2)}%`;
		},
		strikeThroughMethod (person: 'J' | 'D'): string {
			switch (person) {
			case 'D':
				return this.Dave ? '' : 'np';
				break;
			case 'J':
				return this.Jack ? '' : 'np';
				break;
			}
		}
	},
	computed: {
		Jack (): boolean {
			return foodModule().Jack;
		},
		Dave (): boolean {
			return foodModule().Dave;
		},
		filteredDays (): number {
			return mealsModule().meals_length;
		},
		computedTypeItems (): TCategoryTotals {
			const totals: TCategoryTotals = [
				{
					type: 'restaurant',
					D: 0,
					J: 0
				},
				{
					type: 'takeout',
					D: 0,
					J: 0
				},
				{
					type: 'vegetarian',
					D: 0,
					J: 0
				},
			];
			for (const item of mealsModule().meals) {
				for (const person of [ 'J' as const, 'D' as const ]) {
					item[person];
					for (const t of [ 'r' as const, 't' as const, 'v' as const ]) {
						if (item?.[person]?.[t]) {
							const totalsIndex = totals.findIndex((o) => o.type.toLowerCase().startsWith(t));
							const item = totals[totalsIndex];
							if (item) item[person] ++;
						}
					}
				}
			}
			return totals;
		},
	}
});
</script>

<style>
.np{
	text-decoration: line-through;
}
</style>