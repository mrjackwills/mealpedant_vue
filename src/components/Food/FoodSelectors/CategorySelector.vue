<template>
	<v-select
		v-model.lazy='selectedCategory'
		@change='categorySearch'
		@click:clear='reset'
		:items='categories'
		:menu-props='{ maxHeight: "800" }'
		hint='select a category'
		label='Category'
		clearable
		persistent-hint
	/>
</template>

<script lang='ts'>
import { categoriesModule, foodModule, mealsModule, selectorsModule, typesModule } from '@/store';
import { resetFilters } from '@/services/reset';
import { su, TMealType, TPiniaDateMeal } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'category-selector',

	computed: {
		categories (): Array<string> {
			return categoriesModule().sorted_categories_names;
		},
		selectedCategory: {
			get: function (): su {
				return selectorsModule().category;
			},
			set: function (s: su): void {
				selectorsModule().set_category(s);
			}
		},
	},
	
	methods: {
		async reset (): Promise<void> {
			await resetFilters();
		},
		categorySearch (): void {
			if (!this.selectedCategory) return;
			const selectedCategory = this.selectedCategory.toUpperCase();
			const newMealArray: Array<TPiniaDateMeal> = [];
			const filteredTypes: Set<TMealType> = new Set();
			for (const item of mealsModule().meals) {
				const Dc = item.D?.c;
				const Jc = item.J?.c;
				if (Dc && Dc.toUpperCase() === selectedCategory && Jc && Jc.toUpperCase() === selectedCategory) {
					newMealArray.push(item);
					if (item.J?.r || item.D?.r) filteredTypes.add('restaurant');
					if (item.J?.t || item.D?.t) filteredTypes.add('takeout');
					if (item.J?.v || item.D?.v) filteredTypes.add('vegetarian');
				} else if (Dc && Dc.toLocaleUpperCase() === selectedCategory) {
					newMealArray.push({
						da: item.da,
						D: item.D
					});
					if (item.D?.r) filteredTypes.add('restaurant');
					if (item.D?.t) filteredTypes.add('takeout');
					if (item.D?.v) filteredTypes.add('vegetarian');
				} else if (Jc && Jc.toUpperCase() === selectedCategory) {
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
		}
	}
});
</script>
