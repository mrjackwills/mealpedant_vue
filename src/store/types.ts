import { defineStore } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { TMealType } from '@/types';

export const typesModule = defineStore(ModuleName.Types, {
	state: () => ({ types: [ 'vegetarian', 'takeout', 'restaurant' ] as Array<TMealType> }),

	actions: {
		set_types (x: Array<TMealType>) {
			this.types = x;
		}
	}
});
