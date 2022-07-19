import { defineStore } from 'pinia';
import { ModuleName } from '@/types/enum_module';
import { su, TMealType, u } from '@/types';

export const selectorsModule = defineStore(ModuleName.Selectors, {

	state: () => ({
		category: undefined as su,
		searchTerm: undefined as su,
		type: undefined as u<TMealType>,

	}),

	actions: {

		set_category (x: su) : void {
			this.category = x;
		},
		set_searchTerm (x: su) : void {
			this.searchTerm = x;
		},
		set_type (x: u<TMealType>) : void {
			this.type = x;
		}
	}
});