
import { defineStore, getActivePinia } from 'pinia';
import { ModuleName } from '@/types/const_module';
import type { c_MealInfo, MealCategoryMap, MealDescriptionMap, TMealVariant, DateMeal, MealInfo, TPersonFood, TPerson, search_by, c_search_by, MealHistoryValue } from '@/types';

import { snackError } from '@/services/snack';
import { genesisDateString, todayDateString } from '@/vanillaTS/helpers';

type BothTPersonFood = {
	Dave?: TPersonFood;
	Jack?: TPersonFood;
};

// Convert a yymmdd to yyyy-mm-dd
const uncompress_date = (input: string): string => `20${input.at(0)}${input.at(1)}-${input.at(2)}${input.at(3)}-${input.at(4)}${input.at(5)}`;

// Convert a yyyy-mm-dd to yymmdd
const compress_date = (input: string): string => input.slice(2).replaceAll('-', '');

// Convert the compressed response to one with more meaningful names, and create maps for the categories and descriptions
const uncompress_meals = (input: c_MealInfo): MealInfo | undefined => {
	try {
		const meal_descriptions = new Map<number, string>(Object.entries(input.d).map(([key, value]) => [Number(key), value]));

		const meal_categories = new Map<number, string>(Object.entries(input.c).map(([key, value]) => [Number(key), value]));

		const date_meals = [];
		for (const i of input.m) {
			const entry: DateMeal = { date: uncompress_date(i.a) };
			if (i.j) {
				const jack: TPersonFood = {
					meal_description_id: i.j.m,
					meal_category_id: i.j.c
				};
				if (i.j.r) jack.restaurant = i.j.r;
				if (i.j.v) jack.vegetarian = i.j.v;
				if (i.j.t) jack.takeaway = i.j.t;
				if (i.j.p) jack.photo = {
					original: i.j.p.o,
					converted: i.j.p.c
				};
				entry.Jack = jack;
			}
			if (i.d) {
				const dave: TPersonFood = {
					meal_description_id: i.d.m,
					meal_category_id: i.d.c
				};
				dave.restaurant = i.d.r;
				if (i.d.v) dave.vegetarian = i.d.v;
				if (i.d.t) dave.takeaway = i.d.t;
				if (i.d.p) dave.photo = {
					original: i.d.p.o,
					converted: i.d.p.c
				};
				entry.Dave = dave;
			}
			date_meals.push(entry);
		}
		return {
			meal_categories,
			meal_descriptions,
			date_meals
		};
	} catch (e) {
		snackError({ message: `${e}` });
	}
};

const default_search_by = (): search_by => {
	return {
		category_id: 0,
		end_date: todayDateString(),
		include_dave: userModule().authenticated,
		include_jack: true,
		include_restaurant: true,
		include_takeaway: true,
		include_vegetarian: true,
		only_photos: false,
		start_date: genesisDateString(),
		term: ''
	};
};

const num_to_bool = (x: number): boolean => x === 1;
const bool_to_num = (x: boolean): number => x ? 1 : 0;

// convert a search_by to a compress_search_by
const compress_search_by = (x: search_by): c_search_by => {
	const dsb = default_search_by();
	return {
		c: x.category_id !== dsb.category_id ? x.category_id : undefined,
		d: x.include_dave !== dsb.include_dave ? bool_to_num(x.include_dave) : undefined,
		e: x.end_date !== dsb.end_date ? compress_date(x.end_date) : undefined,
		j: x.include_jack !== dsb.include_jack ? bool_to_num(x.include_jack) : undefined,
		m: x.term !== dsb.term ? x.term : undefined,
		p: x.only_photos !== dsb.only_photos ? bool_to_num(x.only_photos) : undefined,
		r: x.include_restaurant !== dsb.include_restaurant ? bool_to_num(!x.include_restaurant) : undefined,
		s: x.start_date !== dsb.start_date ? compress_date(x.start_date) : undefined,
		t: x.include_takeaway !== dsb.include_takeaway ? bool_to_num(!x.include_takeaway) : undefined,
		v: x.include_vegetarian !== dsb.include_vegetarian ? bool_to_num(!x.include_vegetarian) : undefined
	};
};

// convert a compressed_search_by to a search_by
const uncompress_search_by = (x: c_search_by): search_by => {
	const dsb = default_search_by();
	if (x.c && x.c !== dsb.category_id) dsb.category_id = x.c;
	if (x.d && num_to_bool(x.d) !== dsb.include_dave) dsb.include_dave = num_to_bool(x.d);
	if (x.e && x.e !== dsb.end_date) dsb.end_date = uncompress_date(x.e);
	if (x.j && num_to_bool(x.j) !== dsb.include_jack) dsb.include_jack = num_to_bool(x.j);
	if (x.m && x.m !== dsb.term) dsb.term = x.m;
	if (x.p && num_to_bool(x.p) !== dsb.only_photos) dsb.only_photos = num_to_bool(x.p);
	if (x.r) dsb.include_restaurant = false;
	if (x.s && x.s !== dsb.start_date) dsb.start_date = uncompress_date(x.s);
	if (x.t) dsb.include_takeaway = false;
	if (x.v) dsb.include_vegetarian = false;
	if (!userModule().authenticated) dsb.include_dave = false;
	return dsb;
};

type SearchHistory = Map<string, MealHistoryValue>;

export const mealModule = defineStore(ModuleName.Meal, {
	state: () => ({
		hash: '',
		date_meals: [] as Array<DateMeal>,
		meal_descriptions: new Map() as MealDescriptionMap,
		meal_categories: new Map() as MealCategoryMap,
		meal_types: ['restaurant', 'takeaway', 'vegetarian'] as Array<TMealVariant>,

		search_by: default_search_by(),
		search_history: new Map() as SearchHistory,

		is_filtered: false,
		filter_b64: '',
		filtered_date_meals: [] as Array<DateMeal>,
		filtered_meal_categories: new Map() as MealCategoryMap,
		filtered_meal_descriptions: new Map() as MealDescriptionMap,
		filtered_meal_variants: new Set() as Set<TMealVariant>,
		filtered_search_term_date: 0,
		filtered_search_term: ''
	}),

	getters: {
		show_jack (): boolean {
			return this.search_by.include_jack;
		},
		show_dave (): boolean {
			return this.search_by.include_dave;
		},
		get_meal_types (): Array<TMealVariant> {
			return this.is_filtered ? Array.from(this.filtered_meal_variants).sort((a, b) => a.localeCompare(b)) : this.meal_types;
		},
		get_category_by_id: (state) => {
			return (id: number): string => state.meal_categories.get(id) ?? '';
		},
		// return the categories by alphabetical order
		get_all_categories_sorted_alpha (): Array<[number, string]> {
			return Array.from(this.is_filtered ? this.filtered_meal_categories : this.meal_categories).sort((a, b) => a[1].localeCompare(b[1]));
		},
		get_description_by_id: (state) => {
			return (id: number): string => state.meal_descriptions.get(id) ?? '';
		},
		// Get number of un-filtered meals
		meals_length (): number {
			return this.date_meals.length;
		},

		// Return meals, if a filter is applied, return the filtered meals
		get_meals (): MealInfo {
			if (this.is_filtered) {
				return {
					date_meals: this.filtered_date_meals,
					meal_categories: this.filtered_meal_categories,
					meal_descriptions: this.filtered_meal_descriptions
				};
			} else {
				return {
					date_meals: this.date_meals,
					meal_categories: this.meal_categories,
					meal_descriptions: this.meal_descriptions
				};
			}
		}
	},

	actions: {
		set (x: c_MealInfo) {
			const meals = uncompress_meals(x);
			if (meals) {
				this.date_meals = meals.date_meals;
				this.meal_descriptions = meals.meal_descriptions;
				this.meal_categories = meals.meal_categories;
			}
		},

		set_hash (x: string) {
			this.hash = x;
		},

		clear_search_history () {
			this.search_history = new Map();
		},

		// Clear all the filters, will still keep search history in a map
		clear_all_filters () {
			this.filtered_meal_descriptions = new Map();
			this.filtered_meal_categories = new Map();
			this.filtered_meal_variants = new Set();
			this.filtered_search_term_date = 0;
			this.is_filtered = false;
			this.filtered_date_meals = [];
			this.search_by = default_search_by();
			this.filter_b64 = '';
			this.router.replace({ query: {} });
		},

		// Toggle vegetarian, then search
		set_search_by_vegetarian () {
			this.search_by.include_vegetarian = !this.search_by.include_vegetarian;
			this.filter_by_search_by();
		},

		// Toggle restaurant, then search
		set_search_by_restaurant () {
			this.search_by.include_restaurant = !this.search_by.include_restaurant;
			this.filter_by_search_by();
		},

		// Toggle takeaway, then search
		set_search_by_takeaway () {
			this.search_by.include_takeaway = !this.search_by.include_takeaway;
			this.filter_by_search_by();
		},

		// Toggle person, then search
		set_search_by_person (person: TPerson) {
			if (person === 'Jack') this.search_by.include_jack = !this.search_by.include_jack;
			else this.search_by.include_dave = !this.search_by.include_dave;
			this.filter_by_search_by();
		},

		// Toggle photo only, then search
		set_search_by_photo () {
			this.search_by.only_photos = !this.search_by.only_photos;
			this.filter_by_search_by();
		},

		// Set a search term, then search
		set_search_by_term (x: string) {
			this.search_by.term = x;
			this.filter_by_search_by();
		},

		// Set the enddate, then search
		set_search_by_end_date (x: string) {
			this.search_by.end_date = x;
			this.filter_by_search_by();
		},

		// Set the startdate, then search
		set_search_by_start_date (x: string) {
			this.search_by.start_date = x;
			this.filter_by_search_by();
		},

		// Set the category, then search
		set_search_by_category (x: string) {
			const id = Array.from(this.meal_categories).find((i) => i[1] === x);
			if (id) {
				this.search_by.category_id = id[0];
				this.filter_by_search_by();
			}
		},

		// Attempt to convert a base64 param to a search_by, and then run the search
		param_to_search (x: string) {
			try {
				this.search_by = uncompress_search_by(JSON.parse(atob(x)));
				this.filter_by_search_by();
			} catch {
				snackError({ message: 'Invalid URL search params' });
				getActivePinia()?.router().
					replace({
						path: getActivePinia()?.router().currentRoute.value.path,
						query: {}
					});
			}
		},

		// Remove all diacritics from a string, and uppercase it
		normalise_string (i: string): string {
			return i.normalize('NFD').replaceAll(/\p{Diacritic}/gu, '').
				toUpperCase();
		},

		// Filter the meals by the current search_by settings
		filter_by_search_by () {
			const search_by = this.search_by;
			this.filter_b64 = btoa(JSON.stringify(compress_search_by(search_by)));
			this.router.replace({ query: { filter: this.filter_b64 } });

			const search_by_stringified = JSON.stringify(search_by);
			if (search_by_stringified === JSON.stringify(default_search_by())) {
				this.clear_all_filters();
				return;
			}

			const known = this.search_history.get(search_by_stringified);
			if (known) {
				this.filtered_meal_descriptions = known.filtered_meal_descriptions;
				this.filtered_meal_categories = known.filtered_meal_categories;
				this.filtered_date_meals = known.filtered_date_meals;
				this.filtered_meal_variants = known.filtered_meal_variants;
				this.is_filtered = true;
				return;
			}

			const tmp_cat_id = new Set<number>();
			const tmp_desc_id = new Set<number>();

			const filtered_date_meals = new Map<string, {
				Dave?: TPersonFood;
				Jack?: TPersonFood;
			}>();
			const filtered_meal_variants = new Set<TMealVariant>();

			const search_term = this.normalise_string(search_by.term);
			const cat_id = new Set([...this.meal_categories.entries()].filter(([, i]) => i.includes(search_term)).map(([id]) => id));
			const desc_id = new Set([...this.meal_descriptions.entries()].filter(([, i]) => this.normalise_string(i).includes(search_term)).map(([id]) => id));

			for (const meal of this.date_meals) {
				for (const person of ['Jack' as const, 'Dave' as const]) {
					if (!search_by.include_dave && person === 'Dave' || !search_by.include_jack && person === 'Jack') continue;
					if (meal[person]) {
						if (meal.date > search_by.end_date ||
						  meal.date < search_by.start_date ||
						  search_by.only_photos && !meal[person]?.photo ||
						  !search_by.include_takeaway && !meal[person]?.takeaway ||
						  !search_by.include_vegetarian && !meal[person]?.vegetarian ||
						  !search_by.include_restaurant && !meal[person]?.restaurant) continue;

						const known_category = meal[person].meal_category_id === search_by.category_id;
						const has_category_description = cat_id.has(meal[person].meal_category_id) || desc_id.has(meal[person].meal_description_id);

						if (search_by.category_id && !search_by.term && known_category ||
						  !search_by.category_id && !search_by.term ||
						  !search_by.category_id && search_by.term && has_category_description ||
						  search_by.category_id && search_by.term && known_category && has_category_description
						) {
							this.add_entry(filtered_date_meals, filtered_meal_variants, meal, person, tmp_cat_id, tmp_desc_id);
						}
					}
				}
			}

			this.filtered_meal_descriptions = this.get_filtered_map(tmp_desc_id, this.meal_descriptions);
			this.filtered_meal_categories = this.get_filtered_map(tmp_cat_id, this.meal_categories);
			this.filtered_date_meals = this.converted_map_to_array(filtered_date_meals);
			this.filtered_meal_variants = filtered_meal_variants;

			this.search_history.set(search_by_stringified, {
				filtered_meal_descriptions: this.filtered_meal_descriptions,
				filtered_meal_categories: this.filtered_meal_categories,
				filtered_meal_variants,
				filtered_date_meals: this.filtered_date_meals
			});

			this.is_filtered = true;
		},

		/*
		 * Get the total number of meals, not just meal_dates, most of the time it will be meal_dates *2, but you never know
		 * Will check if filtered or not
		 */
		get_total_meals_visible (): number {
			let total = 0;
			if (this.is_filtered) {
				for (const x of this.filtered_date_meals.values()) {
					if (x.Dave) total += 1;
					if (x.Jack) total += 1;
				}
			} else {
				for (const x of this.date_meals.values()) {
					if (x.Dave) total += 1;
					if (x.Jack) total += 1;
				}
			}
			return total;
		},

		// Get total number of meals, ignoring if filtered or not
		get_total_meals (): number {
			let total = 0;
			for (const x of this.date_meals.values()) {
				if (x.Dave) total += 1;
				if (x.Jack) total += 1;
			}
			return total;
		},

		// Add an entry to the filtered_output, and add variants, and description/category id's
		add_entry (
			filtered_date_meals: Map<string, BothTPersonFood>,
			filtered_meal_variants: Set<TMealVariant>,
			meal: DateMeal,
			person: TPerson,
			tmp_cat_id: Set<number>,
			tmp_desc_id: Set<number>
		) {
			this.add_variant(filtered_meal_variants, meal, person);
			this.add_description_category_id(tmp_cat_id, tmp_desc_id, meal, person);
			this.add_date_meal(filtered_date_meals, meal, person);
		},

		// Add a given meals description & category id's to the temp sets
		add_description_category_id (temp_category_id_set: Set<number>, temp_meal_description_id_set: Set<number>, meal: DateMeal, person: TPerson) {
			if (meal[person]) {
				temp_category_id_set.add(meal[person].meal_category_id);
				temp_meal_description_id_set.add(meal[person].meal_description_id);
			}
		},

		// Check if a given datemeal/person in order to populate the filtered_meal_variants
		add_variant (filtered_meal_variants: Set<TMealVariant>, meal: DateMeal, person: TPerson) {
			if (meal[person]?.restaurant) filtered_meal_variants.add('restaurant');
			if (meal[person]?.restaurant) filtered_meal_variants.add('takeaway');
			if (meal[person]?.restaurant) filtered_meal_variants.add('vegetarian');
		},

		/*
		 * Convert from a BothTPersonFood map to an Array<DateMeal>
		 * Used so we don't have to use findIndex on huge arrays
		 */
		converted_map_to_array (filtered_date_meals: Map<string, BothTPersonFood>): Array<DateMeal> {
			const output = [];
			for (const [key, value] of filtered_date_meals) {
				output.push({
					date: key,
					Jack: value.Jack,
					Dave: value.Dave
				});
			}
			output.sort((a, b) => b.date.localeCompare(a.date));
			return output;
		},

		/*
		 * Add a filtered meal to the filtered array, using the index of a meal already in the array,
		 * else add a new entry for a given person
		 */
		add_date_meal (filtered_date_meals: Map<string, BothTPersonFood>, meal: DateMeal, person: TPerson) {
			const exists = filtered_date_meals.get(meal.date);
			if (meal.Jack) {
				if (exists) exists.Jack = meal.Jack;
				else if (person === 'Jack') filtered_date_meals.set(meal.date, { Jack: meal.Jack });
			}
			if (meal.Dave) {
				if (exists) exists.Dave = meal.Dave;
				else if (person === 'Dave') filtered_date_meals.set(meal.date, { Dave: meal.Dave });
			}
		},

		// Convert a set into a map, for descriptions & categories
		get_filtered_map<T>(ids: Set<number>, map: Map<number, T>): Map<number, T> {
			const filteredMap = new Map<number, T>();
			for (const id of ids) {
				const value = map.get(id);
				if (value) filteredMap.set(id, value);
			}
			return filteredMap;
		}
	}
});
