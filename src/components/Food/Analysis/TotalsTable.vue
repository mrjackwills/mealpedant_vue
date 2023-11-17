<template>
	<v-row justify='center' class=''>
		<v-col justify='center' cols='12' md='7' class=''>
			<v-data-table
				:headers='categoriesHeaders'
				:items='computedTypeItems'
				class='elevation-1 ma-0 pa-0'
				density='compact'
				item-key='name'
				hover
				hide-default-footer
				must-sort
			>
				<template v-slot:item='{ item }'>
					<tr>
						<td >
							<span :class='{"smalltext": mdAndDown}'>{{ item.type }}</span>
						</td>
						<td>
							<v-row class='no-gutters text-mealtype ma-0 pa-0' align='center' :class='{"smalltext": mdAndDown}'>
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
						<td v-for='(name, index) in personArray' :key='index' :class='(index === 0) ? "text-primary" : "text-secondary"'>
							<v-row class='no-gutters ma-0 pa-0' align='center' :class='{"smalltext": mdAndDown}'>
								<v-col cols='auto' class='ma-0 pa-0'>
									<div class='' :class='strikeThroughMethod(name)'>
										{{ item[name] }}
									</div>
								</v-col>
								<v-spacer />
								<v-col cols='auto' class='ml-2 ma-0 pa-0 text-right'>
									<div class='' :class='strikeThroughMethod(name)'>
										({{ percentage(String(item.D), String(item.J), (index === 0) ) }})
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
				<template v-slot:bottom='{ }'>
					<v-row justify='center' class='ma-0 pa-0'>
						<v-col cols='auto' class='ma-0 pa-0'>
							total days: {{ totalMeals }}
						</v-col>
					</v-row>
					<v-row justify='center' class='ma-0 pa-0' v-if='filteredDays !== totalMeals'>
						<v-col cols='auto' class='ma-0 pa-0'>
							filtered days: {{ filteredDays }} ({{ (100 / (totalMeals) * filteredDays).toFixed(2) }}%)
						</v-col>
					</v-row>
				</template>
			</v-data-table>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { dexieDB } from '@/services/dexieDb';
import type { TCategoryTotals } from '@/types';
import { useDisplay } from 'vuetify';
const { mdAndDown } = useDisplay();

onMounted(async () => {
	totalMeals.value = await dexieDB.original_number_days();

});

const totalMeals = ref(0);
const personArray = [ 'D' as const, 'J' as const ];
const categoriesHeaders = [
	{
		title: 'Type',
		align: 'start',
		key: 'type',
		sortable: false
	},
	{
		title: 'Total',
		align: 'start',
		sortable: false,
		key: 'total'
	},
	{
		title: 'Dave',
		key: 'Dave',
		align: 'start',
		sortable: false,
	},
	{
		title: 'Jack',
		key: 'Jack',
		align: 'start',
		sortable: false,
	},
] as const;

const percentage = (Dave: string, Jack: string, person: boolean): string => {
	if (Number(Dave) + Number(Jack) === 0) return '0.00%';
	return `${(100 / (Number(Dave) + Number(Jack)) * Number(person ? Dave : Jack)).toFixed(2)}%`;
};
const strikeThroughMethod = (person: 'J' | 'D'): string => {
	switch (person) {
	case 'D':
		return Dave.value ? '' : 'np';
	case 'J':
		return Jack.value ? '' : 'np';
	}
};

const Jack = computed((): boolean =>{
	return foodModule().Jack;
});
const Dave = computed((): boolean =>{
	return foodModule().Dave;
});
const filteredDays = computed((): number =>{
	return mealsModule().meals_length;
});
const computedTypeItems = computed((): TCategoryTotals => {
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
});
</script>

<style>
.np{
	text-decoration: line-through;
}
</style>