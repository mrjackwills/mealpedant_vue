<template>
	<v-data-table
		v-if='tableData'
		v-model:items='tableData'
		:headers='headers'
		:items-per-page='25'
		class='elevation-1'
		density='compact'
		item-key='d'
		hover
	>

		<template v-slot:headers='{ columns, isSorted, getSortIcon, toggleSort }'>
			<tr>
				<template v-for='column in columns' :key='column.key'>
					<td class='unselectable'>
						<span class='ml-2' @click='() => toggleSort(column)' :class='[headerClass(column.title), {"cl": column.sortable}]'>{{ column.title }}</span>
						<template v-if='isSorted(column)'>
							<v-icon :icon='getSortIcon(column)' color='offwhite ml-1' size='small'/>
						</template>
					</td>
				</template>
			</tr>
		</template>
		<template v-slot:[`item.da`]='{ item }'>
			<div v-if='item.D || item.J' class='py-2'>
				<v-row align='start' justify='start' class='no-gutters ma-0 pa-0'>
					<div class='' :class='computedPadding'>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont' >{{ filteredDay(item.da) }}</div>
						</v-col>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont' >{{ filteredDate(item.da) }}</div>
						</v-col>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont' >{{ filteredYear(item.da) }}</div>
						</v-col>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont'> day: {{ filteredDayNumber(item.da) }}</div>
						</v-col>
					</div>
				</v-row>
			</div>
		</template>
		
		<template v-if='Dave' v-slot:[`item.D`]='{ item }'>
			<MealDescription
				v-if='item.D'
				:category='item.D.c'
				:date='item.da'
				:description='item.D.md'
				:key='`D-${item.da}`'
				:photo='item.D.p'
				:restaurant='item.D.r'
				:takeaway='item.D.t'
				:vegetarian='item.D.v'
				person='D'
			/>
		</template>

		<template v-if='Jack' v-slot:[`item.J`]='{ item }'>
			<MealDescription
				v-if='item.J'
				:category='item.J.c'
				:date='item.da'
				:description='item.J.md'
				:key='`J-${item.da}`'
				:photo='item.J.p'
				:restaurant='item.J.r'
				:takeaway='item.J.t'
				:vegetarian='item.J.v'
				person='J'
			/>
		</template>

	</v-data-table>
</template>

<script setup lang='ts'>
import { genesisDate, months, days } from '@/vanillaTS/globalConst';
import type { TPiniaDateMeal } from '@/types';
import { useDisplay } from 'vuetify';
const { mdAndDown } = useDisplay();

const computedDateFont = computed((): string => {
	return mdAndDown.value ? 'smallesttext': 'smalltext';
});
// Padding shrink on small screens - used for date cell
const computedPadding = computed((): string => {
	return mdAndDown.value ? 'pa-1': 'pa-2';
});
// All Dave meals visible status, set&get
const Dave = computed({
	get (): boolean {
		return foodModule().Dave;
	},
	set (b: boolean): void {
		foodModule().set_Dave(b);
	}
});

const headerClass = (x: string |undefined): string => {
	return x === 'Dave' ? 'dave-header': x=== 'Jack' ? 'jack-header' : '';
};

const headers = computed(() => {
	const headers = [];
	headers.push(
		{
			align: 'start' as const,
			class: '',
			sortable: true,
			title: 'Date',
			key: 'da',
			width: '10%'
		},
	);
	if (Dave.value) headers.push(
		{
			align: 'start' as const,
			class: 'dave-header',
			sortable: false,
			title: 'Dave',
			key: 'D',
			width: Jack.value ? '45%' : '90%',

		}
	);

	if (Jack.value) headers.push(
		{
			align: 'start' as const,
			class: 'jack-header',
			sortable: false,
			title: 'Jack',
			key: 'J',
			width: Dave.value ? '45%' : '90%'
		}
	);
	return headers;
});

// All Jack meals visible status, set&get
const Jack = computed({
	get (): boolean {
		return foodModule().Jack;
	},
	set (b: boolean): void {
		foodModule().set_Jack(b);
	}
});

const tableData = computed((): Array<TPiniaDateMeal> => {
	return mealsModule().meals;
});
const filteredDate = (a: string): string => {
	const mealDate = new Date(a);
	return `${mealDate.getUTCDate() } ${months[mealDate.getUTCMonth()]}`;
};
const filteredDay = (a: string): string => {
	return `${days[new Date(a).getUTCDay()]}`;
};
const filteredDayNumber = (a: string): number => {
	const end = new Date(a).getTime();
	return Math.ceil((end - genesisDate) / 1000 / 60 / 60 / 24) + 1;
};
const filteredYear = (a: string): string => {
	return String(new Date(a).getUTCFullYear());
};

</script>

<style>

.dave-header, .jack-header {
	font-size: 1rem
}

td {
    vertical-align: top;
}
/* .v-table > .v-table__wrapper > table {
	width: auto!important;
} */
</style>
