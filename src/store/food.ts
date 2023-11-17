import { defineStore } from 'pinia';
import { genesisDate } from '@/vanillaTS/globalConst';
import { ModuleName } from '@/types/enum_module';
import type { u, su, TPerson } from '@/types';

const date_end = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const date_start = new Date(genesisDate).toISOString().slice(0, 10);

export const foodModule = defineStore(ModuleName.Food, {

	state: () => ({
		button_analysis: false,
		button_date: false,
		button_filters: false,
		button_search: false,
		date_end: date_end,
		date_start: date_start,
		Dave: true,
		dialog: false,
		Jack: true,
		original: true,
		photo_date: <su> undefined,
		photo_disabled: false,
		photo_person: <u<TPerson>> undefined,
		photo_url_converted: <su> undefined,
		photo_url_original: <su> undefined,
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

		set_date_end (x: string) {
			this.date_end = x;
		},

		set_date_start (x: string) {
			this.date_start = x;
		},

		set_Dave (x: boolean) {
			this.Dave = x;
		},

		set_dialog (x: boolean) {
			this.dialog = x;
		},

		set_Jack (x: boolean) {
			this.Jack = x;
		},

		set_original (x: boolean) {
			this.original = x;
		},

		set_photo_date (x: su) {
			this.photo_date = x;
		},

		set_photo_disabled (x: boolean) {
			this.photo_disabled = x;
		},

		set_photo_person (x: u<TPerson>) {
			this.photo_person = x;
		},

		set_photo_url_converted (x: su) {
			this.photo_url_converted = x;
		},

		set_photo_url_original (x: su) {
			this.photo_url_original = x;
		}
	}
});
