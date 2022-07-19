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
		clearable
		persistent-hint
	/>
</template>

<script lang='ts'>
import { mdiMagnify } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { resetFilters } from '@/services/reset';
import { selectorsModule, mealsModule, categoriesModule, foodModule, typesModule } from '@/store';
import { TPiniaDateMeal, TMealType, TCategory, su } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'custom-search-selector',

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle
		};
	},

	computed: {
		searchTerm: {
			get: function (): su {
				return selectorsModule().searchTerm;
			},
			set: function (s: string): void {
				if (s) {
					const a = s.replaceAll(/[^a-z ]+/g, '');
					selectorsModule().set_searchTerm(a.toLowerCase().trim());
				}
				else this.reset();
			}
		},
	},

	data: () => ({
		mdiMagnify,
		pageTitle: '',
	}),

	methods: {
		async reset (): Promise<void> {
			await resetFilters();
			this.pageTitle = '';
		},
		textSearch (): void {
			if (!this.searchTerm) return;
			const searchTerm = this.searchTerm.toLowerCase();
			const currentMealArray = mealsModule().meals;
			const newMealArray: Array<TPiniaDateMeal> = [];
			const filteredTypes: Set<TMealType> = new Set();
			const filteredCategories: Set<TCategory> = new Set();
			this.pageTitle = `search: ${searchTerm}`;

			for (const item of currentMealArray) {
				const Jd = item.J?.md.toLowerCase().includes(searchTerm);
				const Dd = item.D?.md.toLowerCase().includes(searchTerm);
				const Dc = item.D?.c.toLowerCase().includes(searchTerm);
				const Jc = item.J?.c.toLowerCase().includes(searchTerm);
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
		},
	},
});
</script>
