<template>
	<v-row justify='center' class='my-0'>
		<v-col cols='11' md='7' id='headers' class='ma-0 pa-0'>
			<v-data-table-virtual
				:footer-props='footerProps'
				:headers='analysisHeaders'
				:items='tableData'
				class='elevation-1'
				:height='height'
				item-key='name'
			>
				<template v-slot:item='{ item }'>
					<tr>
						<td>
							{{ item.category_name }}
						</td>
						<td class='text-left text-caption' >
							<v-row align='center' justify='end' class='no-gutters ma-0 pa-0'>
								<v-spacer />
								<v-col cols='auto' class='ma-0 pa-0 text-mealtype text-right'>
									<v-row class='no-gutters text-mealtype' align='center' :class='{"smalltext": mdAndDown}'>
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
												class='font-weight-thin text-primary'
												:class='[{"smalltext": mdAndDown}, {"np" : !Dave}]'
											>
												Dave: {{ item.d }} ({{ (100 / (item.t) * item.d).toFixed(2) }}%)
												<span class='smallesttest' v-if='filtered_total !== originalLength && Jack && Dave'>
													({{ (100 / (originalLength) * item.d).toFixed(2) }}%)
												</span>
											</span>
										</v-col>
										<v-col cols='12' class='ma-0 pa-0'>
											<span
												class='font-weight-thin text-secondary'
												:class='[{"smalltext": mdAndDown}, {"np" : !Jack}]'
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
			</v-data-table-virtual>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { dexieDB } from '@/services/dexieDb';
import type { TCategoryTableDate, TPiniaDateMeal, TFooterProps } from '@/types';
import { useDisplay } from 'vuetify';
const { mdAndDown, mdAndUp } = useDisplay();

onBeforeMount(async ()=> {
	originalLength.value = await dexieDB.original_number_meals();
});

const height = computed(():string => {
	if (tableData.value.length < 6) {
		return String((tableData.value.length +1) * 55);
	}
	return '400';
});

const Jack = computed((): boolean => {
	return foodModule().Jack;
});
const Dave = computed((): boolean => {
	return foodModule().Dave;
});
const meals = computed((): Array<TPiniaDateMeal>=> {
	return mealsModule().meals;
});
const filtered_total = computed((): number => {
	let total = 0;
	for (const day of meals.value) {
		if (day.D) total ++;
		if (day.J) total ++;
	}
	return total > originalLength.value ? originalLength.value : total;
});
const footerProps = computed((): TFooterProps =>{
	return {
		itemsPerPageOptions: [ 10, 20, 30, -1 ],
		itemsPerPageText: mdAndUp.value ? 'categories' : 'categories',
	};
});

const tableData = computed((): Array<TCategoryTableDate> => {
	const data = [] ;
	for (const day of meals.value) {
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
});

const originalLength = ref(0);
const analysisHeaders = [
	{
		align: 'start',
		sortable: true,
		title: 'Category',
		key: 'category_name'
	},
	{
		align: 'center',
		sortable: true,
		title: 'Quantity',
		key: 't',
	},
] as const;
</script>