<template>
	<v-select
		v-model='selectedTypes'
		@change='typeSearch'
		@click:clear='reset'
		:items='types'
		:menu-props='{ maxHeight: "400" }'
		item-text='t'
		hint='select type of meal'
		item-value='v'
		label='Type'
		clearable
		persistent-hint
	/>
</template>

<script lang='ts'>
import { categoriesModule, foodModule, mealsModule, selectorsModule, typesModule } from '@/store';
import { resetFilters } from '@/services/reset';
import { TCategory, TMealType, TPiniaDateMeal, u } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'type-selector',

	computed: {
		selectedTypes: {
			get: function (): u<TMealType> {
				return selectorsModule().type;
			},
			set: function (s: TMealType): void {
				selectorsModule().set_type(s);
			}
		},
		types (): Array<TMealType> {
			return typesModule().types;
		},
	},
	
	methods: {
		async reset (): Promise<void> {
			await resetFilters();
		},
		typeSearch (): void {
			if (!this.selectedTypes) return;
			const type = this.selectedTypes[0] as 't' | 'v' | 'r';
			if (!type) return;
			const newMealArray: Array<TPiniaDateMeal> = [];
			const filteredTypes: Array<TMealType> = [ this.selectedTypes ];
			const filteredCategories: Set<TCategory> = new Set();
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
		}
	}
});
</script>