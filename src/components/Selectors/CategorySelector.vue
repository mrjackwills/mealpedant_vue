<template>
	<v-select
		v-model.lazy='selectedCategory'
		@update:modelValue='categorySearch'
		@click:clear='reset'
		:items='categories'
		:menu-props='{ maxHeight: "800" }'
		hint='select a category'
		label='Category'
		clearable
		variant='underlined'
		persistent-hint
	/>
</template>

<script setup lang='ts'>
import { resetFilters } from '@/services/reset';
import type { su, TMealType, TPiniaDateMeal } from '@/types';

const categories = computed((): Array<string> => {
	return categoriesModule().sorted_categories_names;
});
const selectedCategory = computed({
	get (): su {
		return selectorsModule().category;
	},
	set (s: su): void {
		selectorsModule().set_category(s);
	}
});
	
// 	methods: {
const reset = async (): Promise<void> => {
	await resetFilters();
};
const categorySearch = (): void => {
	if (!selectedCategory.value) return;
	const sc = selectedCategory.value.toUpperCase();
	const newMealArray: Array<TPiniaDateMeal> = [];
	const filteredTypes = new Set<TMealType>();
	for (const item of mealsModule().meals) {
		const Dc = item.D?.c;
		const Jc = item.J?.c;
		if (Dc && Dc.toUpperCase() === sc && Jc && Jc.toUpperCase() === sc) {
			newMealArray.push(item);
			if (item.J?.r || item.D?.r) filteredTypes.add('restaurant');
			if (item.J?.t || item.D?.t) filteredTypes.add('takeout');
			if (item.J?.v || item.D?.v) filteredTypes.add('vegetarian');
		} else if (Dc && Dc.toLocaleUpperCase() === sc) {
			newMealArray.push({
				da: item.da,
				D: item.D
			});
			if (item.D?.r) filteredTypes.add('restaurant');
			if (item.D?.t) filteredTypes.add('takeout');
			if (item.D?.v) filteredTypes.add('vegetarian');
		} else if (Jc && Jc.toUpperCase() === sc) {
			newMealArray.push({
				da: item.da,
				J: item.J
			});
			if (item.J?.r) filteredTypes.add('restaurant');
			if (item.J?.t) filteredTypes.add('takeout');
			if (item.J?.v) filteredTypes.add('vegetarian');
		}
	}
	foodModule().set_original(false);
	mealsModule().set_meals(newMealArray);
	typesModule().set_types([ ...filteredTypes ]);
};
</script>
