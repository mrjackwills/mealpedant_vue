import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import type { TMealType } from '@/types';

export const typesModule = defineStore(ModuleName.Types, {
	state: () => ({
		types: <Array<TMealType>> [ 'vegetarian', 'takeout', 'restaurant' ]
	}),

	actions: {
		set_types (x: Array<TMealType>) {
			this.types = x;
		}
	}
});
