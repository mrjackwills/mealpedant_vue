import { defineStore } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { TCategory } from '@/types';

export const categoriesModule = defineStore(ModuleName.Categories, {

	state: () => ({
		categories: [] as Array<TCategory>,
		sorted_categories_names: [] as Array<string>
	}),

	actions: {
		set_categories (x: Array<TCategory>) {
			this.categories = x;
			const sorted = new Set<string>();
			for (const category of x) sorted.add(category.c);
			this.sorted_categories_names = [ ...sorted ].sort();
		}
	}
});