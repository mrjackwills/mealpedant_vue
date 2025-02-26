<template>
	<v-select
		v-model='selectedTypes'
		@update:modelValue='typeSearch'
		@click:clear='reset'
		:items='types'
		:menu-props='{ maxHeight: "400" }'
		item-text='t'
		hint='select type of meal'
		item-value='v'
		label='Type'
		variant='underlined'
		clearable
		persistent-hint
	/>
</template>

<script setup lang='ts'>
import { resetFilters } from '@/services/reset';
import type { TCategory, TMealType, TPiniaDateMeal, u } from '@/types';

const selectedTypes = computed({
	get (): u<TMealType> {
		return selectorsModule().type;
	},
	set (s: u<TMealType>): void {
		selectorsModule().set_type(s);
	}
});
const types = computed((): Array<TMealType> => {
	return typesModule().types;
});
	
const reset = async (): Promise<void> => {
	await resetFilters();
};

const typeSearch = (): void => {
	if (!selectedTypes.value) return;
	const type = selectedTypes.value[0] as 't' | 'v' | 'r';
	if (!type) return;
	const newMealArray: Array<TPiniaDateMeal> = [];
	const filteredTypes: Array<TMealType> = [ selectedTypes.value ];
	const filteredCategories = new Set<TCategory>();
	for (const item of mealsModule().meals) {
		const Dc = item.D?.[type];
		const Jc = item.J?.[type];
		if (Dc && Jc) {
			newMealArray.push(item);
			if (item.D?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
			if (item.J?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
		} else if (Dc) {
			newMealArray.push({
				da: item.da,
				D: item.D
			});
			if (item.D?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
		} else if (Jc) {
			newMealArray.push({
				da: item.da,
				J: item.J
			});
			if (item.J?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
		}
	}
	foodModule().set_original(false);
	mealsModule().set_meals(newMealArray);
	typesModule().set_types([ ...filteredTypes ]);
	categoriesModule().set_categories([ ...filteredCategories ]);
};
</script>