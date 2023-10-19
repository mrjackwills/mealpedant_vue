import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import type { TPiniaDateMeal } from '@/types';

export const mealsModule = defineStore(ModuleName.Meals, {
	state: () => ({
		meals: [] as Array<TPiniaDateMeal>,
	}),

	getters: {
		meals_length (): number {
			return this.meals.length;
		}
	},

	actions: {
		set_meals (x: Array<TPiniaDateMeal>) {
			this.meals = x;
		}
	}

});
