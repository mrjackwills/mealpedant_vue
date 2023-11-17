<template>
	<v-text-field
		v-model='searchTerm'
		@click:append-outer='textSearch'
		@click:clear='reset'
		@keydown.delete='reset'
		@keydown.enter='textSearch'
		@input='textSearch'
		:append-outer-icon='mdiMagnify'
		hint='enter search term'
		label='Text search'
		variant='underlined'
		clearable
		persistent-hint
	/>
</template>

<script setup lang='ts'>
import { mdiMagnify } from '@mdi/js';
import { resetFilters } from '@/services/reset';
import type { TPiniaDateMeal, TMealType, TCategory, su } from '@/types';

const searchTerm = computed({
	get (): su {
		return selectorsModule().searchTerm;
	},
	set (s: su): void {
		if (s) {
			const a = s.replaceAll(/[^a-z ]+/g, '');
			selectorsModule().set_searchTerm(a.toLowerCase().trim());
		}
		else reset();
	}
});

const pageTitle = ref('');

watch(()=> pageTitle.value, (i) => {
	if (i) {
		browserModule().set_pageTitle(i);
	}
});

const reset = async (): Promise<void> => {
	await resetFilters();
	pageTitle.value = '';
};

const textSearch = (): void => {
	if (!searchTerm.value) return;
	const st = searchTerm.value?.toLowerCase();
	const currentMealArray = mealsModule().meals;
	const newMealArray: Array<TPiniaDateMeal> = [];
	const filteredTypes: Set<TMealType> = new Set();
	const filteredCategories: Set<TCategory> = new Set();
	pageTitle.value = `search: ${st}`;

	for (const item of currentMealArray) {
		const Jd = item.J?.md.toLowerCase().includes(st);
		const Dd = item.D?.md.toLowerCase().includes(st);
		const Dc = item.D?.c.toLowerCase().includes(st);
		const Jc = item.J?.c.toLowerCase().includes(st);
		if (Dd && Jd || Dc && Jc || Dc && Jd || Dd && Jc) {
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
			if (item.J?.r || item.D?.r) filteredTypes.add('restaurant');
			if (item.J?.t || item.D?.t) filteredTypes.add('takeout');
			if (item.J?.v || item.D?.v) filteredTypes.add('vegetarian');
		}
		else if (Dd || Dc) {
			newMealArray.push(
				{
					da: item.da,
					D: item.D
				});
			if (item.D?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
			if (item.D?.r) filteredTypes.add('restaurant');
			if (item.D?.t) filteredTypes.add('takeout');
			if (item.D?.v) filteredTypes.add('vegetarian');
		}
		else if (Jd || Jc) {
			newMealArray.push(
				{
					da: item.da,
					J: item.J
				});
			if (item.J?.c) {
				const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
				const x = categoriesModule().categories[y];
				if (x) filteredCategories.add(x);
			}
			if (item.J?.r) filteredTypes.add('restaurant');
			if (item.J?.t) filteredTypes.add('takeout');
			if (item.J?.v) filteredTypes.add('vegetarian');
		}
	}
	mealsModule().set_meals(newMealArray);
	categoriesModule().set_categories([ ...filteredCategories ]);
	typesModule().set_types([ ...filteredTypes ]);
	foodModule().set_original(false);
};
</script>
