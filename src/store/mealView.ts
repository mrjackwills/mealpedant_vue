import { defineStore } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { u, su, TPerson } from '@/types';


export const mealViewModule = defineStore(ModuleName.MealView, {

	state: () => ({
		button_analysis: false,
		button_date: false,
		button_filters: false,
		button_search: false,
		dialog_meal_description: '',
		dialog_photo_person: undefined as u<TPerson>,
		dialog_photo_date: undefined as su,
		dialog_photo_url_converted: undefined as su,
		dialog_photo_url_original: undefined as su,
		dialog_visible: false,
		original: true,
		showInfo: true,
		tableHeight: 300
	}),

	actions: {

		set_button_analysis (x: boolean) {
			this.button_analysis = x;
		},

		set_button_date (x: boolean) {
			this.button_date = x;
		},

		set_button_filters (x: boolean) {
			this.button_filters = x;
		},

		set_button_search (x: boolean) {
			this.button_search = x;
		},

		set_dialog_visible (x: boolean) {
			this.dialog_visible = x;
		},

		set_table_height (x: number) {
			this.tableHeight = x;
		},

		set_showInfo (x: boolean) {
			this.showInfo = x;
		},

		set_original (x: boolean) {
			this.original = x;
		},

		set_photo_date (x: su) {
			this.dialog_photo_date = x;
		},

		clear_photo () {
			this.dialog_meal_description = '';
			this.dialog_photo_person = undefined;
			this.dialog_photo_date = undefined;
			this.dialog_photo_url_converted = undefined;
			this.dialog_photo_url_original = undefined;
		},

		set_dialog_photo_person (x: u<TPerson>) {
			this.dialog_photo_person = x;
		},

		set_dialog_photo_meal_description (x: string) {
			this.dialog_meal_description = x;
		},

		set_dialog_photo_url_converted (x: su) {
			this.dialog_photo_url_converted = x;
		},

		set_dialog_photo_url_original (x: su) {
			this.dialog_photo_url_original = x;
		}
	}
});
