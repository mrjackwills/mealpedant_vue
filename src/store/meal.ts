/* eslint-disable unicorn/no-this-outside-of-class */
import type { c_MealInfo, c_search_by, DateMeal, MealCategoryMap, MealDescriptionMap, MealHistoryValue, MealInfo, search_by, TMealVariant, TPersonFood, TPersonVal } from '@/types'
import { defineStore } from 'pinia'
import router from '@/router'
import { snackError } from '@/services/snack'
import { TPerson } from '@/types'
import { ModuleName } from '@/types/const_module'
import { genesisDateString, todayDateString } from '@/vanillaTS/helpers'

type BothTPersonFood = {
	Dave?: TPersonFood
	Jack?: TPersonFood
}

// Convert a yymmdd to yyyy-mm-dd
const uncompress_date = (input: string): string => `20${input.slice(0, 2)}-${input.slice(2, 4)}-${input.slice(4, 6)}`

// Convert a yyyy-mm-dd to yymmdd
const compress_date = (input: string): string => input.slice(2).replaceAll('-', '')

// Return the default, unfiltered search criteria, with some fields tuned to the current auth state
function default_search_by (authed: boolean): search_by {
	return {
		category_id: 0,
		end_date: todayDateString(),
		include_dave: authed,
		include_jack: true,
		include_restaurant: true,
		include_takeaway: true,
		include_vegetarian: true,
		only_photos: false,
		start_date: genesisDateString(),
		term: '',
	}
}

// Convert the compressed response to one with more meaningful names, and create maps for the categories and descriptions
function uncompress_meals (input: c_MealInfo): MealInfo | undefined {
	try {
		const meal_descriptions = new Map<number, string>(Object.entries(input.d).map(([key, value]) => [Number(key), value]))

		const meal_categories = new Map<number, string>(Object.entries(input.c).map(([key, value]) => [Number(key), value]))

		const date_meals = []
		for (const i of input.m) {
			const entry: DateMeal = { date: uncompress_date(i.a) }
			if (i.j) {
				const jack: TPersonFood = {
					meal_description_id: i.j.m,
					meal_category_id: i.j.c,
				}
				if (i.j.r) {
					jack.restaurant = i.j.r
				}
				if (i.j.v) {
					jack.vegetarian = i.j.v
				}
				if (i.j.t) {
					jack.takeaway = i.j.t
				}
				if (i.j.p) {
					jack.photo = {
						original: i.j.p.o,
						converted: i.j.p.c,
					}
				}
				entry.Jack = jack
			}
			if (i.d) {
				const dave: TPersonFood = {
					meal_description_id: i.d.m,
					meal_category_id: i.d.c,
					restaurant: i.d.r,
				}
				if (i.d.v) {
					dave.vegetarian = i.d.v
				}
				if (i.d.t) {
					dave.takeaway = i.d.t
				}
				if (i.d.p) {
					dave.photo = {
						original: i.d.p.o,
						converted: i.d.p.c,
					}
				}
				entry.Dave = dave
			}
			date_meals.push(entry)
		}
		return {
			meal_categories,
			meal_descriptions,
			date_meals,
		}
	} catch (error) {
		snackError({ message: `${error}` })
		// Returning undefined signals "nothing was loaded", so callers skip the assignment
	}
}

// Convert the compressed 1/0 flag into a boolean
const num_to_bool = (x: number): boolean => x === 1
// Convert a boolean into the compressed 1/0 flag
const bool_to_num = (x: boolean): number => x ? 1 : 0

// Holds the pending debounced filter query-param update
let filterQueryTimeout: ReturnType<typeof setTimeout> | undefined

// Maximum entries kept in the search history & term match caches
const searchHistoryMax = 20
const termMatchCacheMax = 50

// Cache of search term -> matched category/description ids, cleared whenever the meal data changes
const termMatchCache = new Map<string, { categories: Set<number>, descriptions: Set<number> }>()

// Whether date_meals is confirmed sorted ascending by date, recorded when the data loads
let dateMealsSorted = false

type SearchHistory = Map<string, MealHistoryValue>

export const mealModule = defineStore(ModuleName.Meal, {
	// Reactive state: the uncompressed meal dataset, the active search criteria, and the derived filtered view & caches
	state: () => ({
		hash: '',
		date_meals: [] as Array<DateMeal>,
		meal_descriptions: new Map() as MealDescriptionMap,
		meal_description_normalized: new Map() as MealDescriptionMap,
		meal_categories: new Map() as MealCategoryMap,
		meal_types: ['restaurant', 'takeaway', 'vegetarian'] as Array<TMealVariant>,

		default_search_by_stringified: JSON.stringify(default_search_by(userModule().authenticated)),

		search_by: default_search_by(userModule().authenticated),
		search_history: new Map() as SearchHistory,

		is_filtered: false,
		filter_b64: '',
		filtered_date_meals: [] as Array<DateMeal>,
		filtered_meal_categories: new Map() as MealCategoryMap,
		filtered_meal_descriptions: new Map() as MealDescriptionMap,
		filtered_meal_variants: new Set() as Set<TMealVariant>,
		filtered_search_term_date: 0,
		filtered_search_term: '',
	}),

	getters: {

		// Whether the current search includes Jack's meals
		show_jack (): boolean {
			return this.search_by.include_jack
		},
		// Whether the current search includes Dave's meals
		show_dave (): boolean {
			return this.search_by.include_dave
		},
		// Available meal variants, restricted to those present in the filtered results when a filter is applied
		get_meal_types (): Array<TMealVariant> {
			return this.is_filtered ? Array.from(this.filtered_meal_variants).toSorted((a, b) => a.localeCompare(b)) : this.meal_types
		},
		// Get a category name by id, or an empty string if unknown
		get_category_by_id: state => {
			return (id: number): string => state.meal_categories.get(id) ?? ''
		},
		// return the filtered categories by alphabetical order
		get_all_filtered_categories_sorted_alpha (state): Array<[number, string]> {
			const source = state.is_filtered ? state.filtered_meal_categories : state.meal_categories
			return Array.from(source).toSorted((a, b) => a[1].localeCompare(b[1]))
		},
		// return the categories by alphabetical order
		get_all_categories_sorted_alpha (): Array<[number, string]> {
			return Array.from(this.meal_categories).toSorted((a, b) => a[1].localeCompare(b[1]))
		},
		// Get a description name by id, or an empty string if unknown
		get_description_by_id: state => {
			return (id: number): string => state.meal_descriptions.get(id) ?? ''
		},
		// Get number of un-filtered meals
		meals_length (): number {
			return this.date_meals.length
		},

		// Return meals, if a filter is applied, return the filtered meals
		get_meals (): MealInfo {
			return this.is_filtered
				? {
					date_meals: this.filtered_date_meals,
					meal_categories: this.filtered_meal_categories,
					meal_descriptions: this.filtered_meal_descriptions,
				}
				: {
					date_meals: this.date_meals,
					meal_categories: this.meal_categories,
					meal_descriptions: this.meal_descriptions,
				}
		},
	},

	actions: {

		// convert a compressed_search_by to a search_by
		uncompress_search_by (x: c_search_by): search_by {
			const dsb = default_search_by(userModule().authenticated)
			if (x.c && x.c !== dsb.category_id) {
				dsb.category_id = x.c
			}
			if (x.d && num_to_bool(x.d) !== dsb.include_dave) {
				dsb.include_dave = num_to_bool(x.d)
			}
			if (x.e && x.e !== dsb.end_date) {
				dsb.end_date = uncompress_date(x.e)
			}
			if (x.j && num_to_bool(x.j) !== dsb.include_jack) {
				dsb.include_jack = num_to_bool(x.j)
			}
			if (x.m && x.m !== dsb.term) {
				dsb.term = x.m
			}
			if (x.p && num_to_bool(x.p) !== dsb.only_photos) {
				dsb.only_photos = num_to_bool(x.p)
			}
			if (x.r) {
				dsb.include_restaurant = false
			}
			if (x.s && x.s !== dsb.start_date) {
				dsb.start_date = uncompress_date(x.s)
			}
			if (x.t) {
				dsb.include_takeaway = false
			}
			if (x.v) {
				dsb.include_vegetarian = false
			}
			if (!userModule().authenticated) {
				dsb.include_dave = false
			}
			return dsb
		},

		// convert a search_by to a compress_search_by
		compress_search_by (x: search_by): c_search_by {
			const dsb = default_search_by(userModule().authenticated)
			return {
				c: x.category_id === dsb.category_id ? undefined : x.category_id,
				d: x.include_dave === dsb.include_dave ? undefined : bool_to_num(x.include_dave),
				e: x.end_date === dsb.end_date ? undefined : compress_date(x.end_date),
				j: x.include_jack === dsb.include_jack ? undefined : bool_to_num(x.include_jack),
				m: x.term === dsb.term ? undefined : x.term,
				p: x.only_photos === dsb.only_photos ? undefined : bool_to_num(x.only_photos),
				r: x.include_restaurant === dsb.include_restaurant ? undefined : bool_to_num(!x.include_restaurant),
				s: x.start_date === dsb.start_date ? undefined : compress_date(x.start_date),
				t: x.include_takeaway === dsb.include_takeaway ? undefined : bool_to_num(!x.include_takeaway),
				v: x.include_vegetarian === dsb.include_vegetarian ? undefined : bool_to_num(!x.include_vegetarian),
			}
		},

		// Replace the whole meal dataset from a (possibly cached) compressed response, and rebuild all derived state
		set (x: c_MealInfo) {
			const meals = uncompress_meals(x)
			if (meals) {
				this.date_meals = meals.date_meals
				this.meal_descriptions = meals.meal_descriptions
				this.meal_categories = meals.meal_categories
				// Normalised copy (diacritics removed, uppercased) so term matching is case & diacritic insensitive
				this.meal_description_normalized = new Map<number, string>(
					[...meals.meal_descriptions.entries()].map(([key, value]) => [
						key,
						this.normalise_string(value),
					]),
				)

				// Detect whether the meals arrived sorted ascending by date, so searches can skip out-of-range slices.
				// every() short-circuits on the first out-of-order pair, like the old break
				dateMealsSorted = meals.date_meals.every((meal, i, arr) => i === 0 || arr[i - 1].date <= meal.date)

				// The underlying data changed, so cached term matches are stale
				termMatchCache.clear()
			}
		},

		// Store the data-source hash, used to detect when the server's meal data changes
		set_hash (x: string) {
			this.hash = x
		},

		// Drop all cached filter results
		clear_search_history () {
			this.search_history = new Map()
		},

		// Clear all the filters, will still keep search history in a map
		clear_all_filters () {
			clearTimeout(filterQueryTimeout)
			this.filtered_meal_descriptions = new Map()
			this.filtered_meal_categories = new Map()
			this.filtered_meal_variants = new Set()
			this.filtered_search_term_date = 0
			this.is_filtered = false
			this.filtered_date_meals = []
			this.search_by = default_search_by(userModule().authenticated)
			this.filter_b64 = ''
			if (router.currentRoute.value.query.filter !== undefined) {
				router.replace({ query: {} })
			}
		},

		// Toggle vegetarian, then search
		set_search_by_vegetarian () {
			this.search_by.include_vegetarian = !this.search_by.include_vegetarian
			this.filter_by_search_by()
		},

		// Toggle restaurant, then search
		set_search_by_restaurant () {
			this.search_by.include_restaurant = !this.search_by.include_restaurant
			this.filter_by_search_by()
		},

		// Toggle takeaway, then search
		set_search_by_takeaway () {
			this.search_by.include_takeaway = !this.search_by.include_takeaway
			this.filter_by_search_by()
		},

		// Toggle person, then search
		set_search_by_person (person: TPersonVal) {
			if (person === TPerson.JACK) {
				this.search_by.include_jack = !this.search_by.include_jack
			} else {
				this.search_by.include_dave = !this.search_by.include_dave
			}
			this.filter_by_search_by()
		},

		// Toggle photo only, then search
		set_search_by_photo () {
			this.search_by.only_photos = !this.search_by.only_photos
			this.filter_by_search_by()
		},

		// Set a search term, then search
		set_search_by_term (x: string) {
			this.search_by.term = x
			this.filter_by_search_by()
		},

		// Set the enddate, then search
		set_search_by_end_date (x: string) {
			this.search_by.end_date = x
			this.filter_by_search_by()
		},

		// Set the startdate, then search
		set_search_by_start_date (x: string) {
			this.search_by.start_date = x
			this.filter_by_search_by()
		},

		// Set the category, then search
		set_search_by_category (x: string) {
			const id = Array.from(this.meal_categories).find(i => i[1] === x)
			if (id) {
				this.search_by.category_id = id[0]
				this.filter_by_search_by()
			}
		},

		// Attempt to convert a base64 param to a search_by, and then run the search
		param_to_search (x: string) {
			try {
				this.search_by = this.uncompress_search_by(JSON.parse(atob(x)))
				this.filter_by_search_by()
			} catch {
				snackError({ message: 'Invalid URL search params' })
				router.replace({
					path: router.currentRoute.value.path,
					query: {},
				})
			}
		},

		// Remove all diacritics from a string, and uppercase it
		normalise_string (i: string): string {
			return i.normalize('NFD').replaceAll(/\p{Diacritic}/gu, '').toUpperCase()
		},

		/*
		 * Recompute the filtered view from the full dataset using the current search_by criteria.
		 * Results are cached by the serialised search_by, so repeated or cycled searches are instant,
		 * and the shareable ?filter= URL is updated lazily on success.
		 */
		filter_by_search_by (): void {
			const { search_by } = this
			// Serialise the whole criteria as the cache key, so identical searches hit the cache
			const searchKey = JSON.stringify(search_by)

			// Default (unfiltered) search == just clear any applied filter, nothing else to compute
			if (searchKey === this.default_search_by_stringified) {
				this.clear_all_filters()
				return
			}

			// Record the shareable, compressed base64 form of the criteria, ignoring entries identical to the defaults
			this.filter_b64 = btoa(JSON.stringify(this.compress_search_by(search_by)))

			const cachedResult = this.search_history.get(searchKey)
			if (cachedResult) {
				// Cache hit: restore the exact previously computed view, no need to re-scan the dataset
				this.search_history.delete(searchKey)
				this.search_history.set(searchKey, cachedResult)
				this.filtered_meal_descriptions = cachedResult.filtered_meal_descriptions
				this.filtered_meal_categories = cachedResult.filtered_meal_categories
				this.filtered_date_meals = cachedResult.filtered_date_meals
				this.filtered_meal_variants = cachedResult.filtered_meal_variants
				this.is_filtered = true
				this.update_filter_query()
				return
			}

			// Normalise the term once, so it compares correctly against the already-normalised descriptions
			const searchTerm = this.normalise_string(search_by.term || '')

			// Sets of category/description ids whose name contains the term, used to match meals fast later
			let matchedCategoryIds = new Set<number>()
			let matchedDescriptionIds = new Set<number>()

			if (searchTerm) {
				// Reuse the precomputed term matches when available, so re-searching a term is near-free
				let termMatches = termMatchCache.get(searchTerm)
				if (!termMatches) {
					const categories = new Set<number>()
					const descriptions = new Set<number>()
					// Brute-force scan for matching names — done once per new term, then cached
					for (const [id, name] of this.meal_categories) {
						if (name.includes(searchTerm)) {
							categories.add(id)
						}
					}
					for (const [id, name] of this.meal_description_normalized) {
						if (name.includes(searchTerm)) {
							descriptions.add(id)
						}
					}
					termMatches = { categories, descriptions }
					termMatchCache.set(searchTerm, termMatches)

					// Evict the oldest entry when over the cap, keeping the cache memory bounded
					if (termMatchCache.size > termMatchCacheMax) {
						const oldest = termMatchCache.keys().next().value
						if (oldest !== undefined) {
							termMatchCache.delete(oldest)
						}
					}
				}
				matchedCategoryIds = termMatches.categories
				matchedDescriptionIds = termMatches.descriptions
			}

			// Which people this search should include, derived from the include_* toggles
			const targetPeople = [] as Array<typeof TPerson.DAVE | typeof TPerson.JACK>
			if (search_by.include_dave) {
				targetPeople.push(TPerson.DAVE)
			}
			if (search_by.include_jack) {
				targetPeople.push(TPerson.JACK)
			}

			// Accumulators: ids of the categories/descriptions present in the results, the variants seen, and the matching days keyed by date
			const tmpCatId = new Set<number>()
			const tmpDescId = new Set<number>()
			const filteredMealVariants = new Set<TMealVariant>()
			const filteredDateMealsMap = new Map<string, BothTPersonFood>()

			/*
			 * Test one meal's people against every filter. Each check is an early-out;
			 * only reaching the bottom means that person's meal is included in the result.
			 */
			const process_meal = (meal: DateMeal): void => {
				for (const person of targetPeople) {
					const mealPerson = meal[person]
					if (!mealPerson) {
						continue // this person didn't eat on this date
					}
					if (search_by.only_photos && !mealPerson.photo) {
						continue // photos-only filter rejects meals without a photo
					}
					if (!search_by.include_takeaway && mealPerson.takeaway) {
						continue // takeaway meals are excluded
					}
					if (!search_by.include_vegetarian && mealPerson.vegetarian) {
						continue // vegetarian meals are excluded
					}
					if (!search_by.include_restaurant && mealPerson.restaurant) {
						continue // restaurant meals are excluded
					}
					if (search_by.category_id && mealPerson.meal_category_id !== search_by.category_id) {
						continue // different category than the one selected
					}
					if (searchTerm && !matchedCategoryIds.has(mealPerson.meal_category_id) && !matchedDescriptionIds.has(mealPerson.meal_description_id)) {
						continue // term not found in this meal's category or description
					}

					this.add_entry(filteredDateMealsMap, filteredMealVariants, tmpCatId, tmpDescId, meal, person, mealPerson)
				}
			}

			/*
			 * Walk only the meals within the date range. When the data is sorted ascending
			 * we binary-search straight to the start of the range and stop at its end.
			 */
			if (dateMealsSorted) {
				// Find the first index whose date is >= start_date (standard lower-bound search)
				let low = 0
				let high = this.date_meals.length
				while (low < high) {
					const mid = Math.floor((low + high) / 2)
					if (this.date_meals[mid].date < search_by.start_date) {
						low = mid + 1
					} else {
						high = mid
					}
				}
				// Iterate from there, stopping at the first meal past end_date (all later ones are even newer)
				for (const meal of this.date_meals.slice(low)) {
					if (meal.date > search_by.end_date) {
						break
					}
					process_meal(meal)
				}
			} else {
				// Unsorted data: fall back to scanning everything, only processing meals inside the range
				for (const meal of this.date_meals) {
					if (meal.date >= search_by.start_date && meal.date <= search_by.end_date) {
						process_meal(meal)
					}
				}
			}

			// Assemble the final view from the accumulated ids, the variant set and the sorted day list
			this.filtered_meal_descriptions = this.get_filtered_map(tmpDescId, this.meal_descriptions)
			this.filtered_meal_categories = this.get_filtered_map(tmpCatId, this.meal_categories)
			this.filtered_date_meals = this.converted_map_to_array(filteredDateMealsMap)
			this.filtered_meal_variants = filteredMealVariants

			// Store the computed view so the same search is instant next time
			this.search_history.set(searchKey, {
				filtered_meal_descriptions: this.filtered_meal_descriptions,
				filtered_meal_categories: this.filtered_meal_categories,
				filtered_meal_variants: this.filtered_meal_variants,
				filtered_date_meals: this.filtered_date_meals,
			})

			// Evict the oldest cached entry when over the cap (LRU), keeping cache memory bounded
			if (this.search_history.size > searchHistoryMax) {
				const oldest = this.search_history.keys().next().value
				if (oldest !== undefined) {
					this.search_history.delete(oldest)
				}
			}

			this.is_filtered = true
			this.update_filter_query()
		},

		/*
		 * Update the filter query param in the URL
		 * The query param is only read on mount, so it's safe to update lazily
		 */
		update_filter_query () {
			clearTimeout(filterQueryTimeout)
			if (router.currentRoute.value.query.filter === this.filter_b64) {
				return
			}
			filterQueryTimeout = setTimeout(() => {
				router.replace({ query: { filter: this.filter_b64 } })
			}, 300)
		},

		/*
		 * Get the total number of meals, not just meal_dates, most of the time it will be meal_dates *2, but you never know
		 * Will check if filtered or not
		 */
		get_total_meals_visible (): number {
			let total = 0
			if (this.is_filtered) {
				for (const x of this.filtered_date_meals.values()) {
					if (x.Dave) {
						total += 1
					}
					if (x.Jack) {
						total += 1
					}
				}
			} else {
				for (const x of this.date_meals.values()) {
					if (x.Dave) {
						total += 1
					}
					if (x.Jack) {
						total += 1
					}
				}
			}
			return total
		},

		// Get total number of meals, ignoring if filtered or not
		get_total_meals (): number {
			let total = 0
			for (const x of this.date_meals.values()) {
				if (x.Dave) {
					total += 1
				}
				if (x.Jack) {
					total += 1
				}
			}
			return total
		},

		// Add a matched meal/person to the filtered output, and record variants & description/category ids
		add_entry (
			filtered_date_meals: Map<string, BothTPersonFood>,
			filtered_meal_variants: Set<TMealVariant>,
			temp_category_id_set: Set<number>,
			temp_meal_description_id_set: Set<number>,
			meal: DateMeal,
			person: TPersonVal,
			meal_person: TPersonFood,
		) {
			this.add_variant(filtered_meal_variants, meal_person)
			this.add_description_category_id(temp_category_id_set, temp_meal_description_id_set, meal_person)

			// Merge into the existing day's entry, or create a new one for just this person
			const exists = filtered_date_meals.get(meal.date)
			if (exists) {
				exists[person] = meal_person
			} else if (person === TPerson.JACK) {
				filtered_date_meals.set(meal.date, { Jack: meal_person })
			} else {
				filtered_date_meals.set(meal.date, { Dave: meal_person })
			}
		},

		// Add a given person food's variant flags to the set
		add_variant (filtered_meal_variants: Set<TMealVariant>, meal_person: TPersonFood) {
			if (meal_person.restaurant) {
				filtered_meal_variants.add('restaurant')
			}
			if (meal_person.takeaway) {
				filtered_meal_variants.add('takeaway')
			}
			if (meal_person.vegetarian) {
				filtered_meal_variants.add('vegetarian')
			}
		},

		// Add a given person food's description & category ids to the temp sets
		add_description_category_id (temp_category_id_set: Set<number>, temp_meal_description_id_set: Set<number>, meal_person: TPersonFood) {
			temp_category_id_set.add(meal_person.meal_category_id)
			temp_meal_description_id_set.add(meal_person.meal_description_id)
		},

		/*
		 * Convert from a BothTPersonFood map to an Array<DateMeal>
		 * Used so we don't have to use findIndex on huge arrays
		 */
		converted_map_to_array (filtered_date_meals: Map<string, BothTPersonFood>): Array<DateMeal> {
			const output = []
			for (const [key, value] of filtered_date_meals) {
				output.push({
					date: key,
					Jack: value.Jack,
					Dave: value.Dave,
				})
			}
			// ISO dates order identically under relational comparison, much faster than localeCompare
			output.sort((a, b) => (a.date < b.date ? 1 : (a.date > b.date ? -1 : 0)))
			return output
		},

		// Convert a set into a map, for descriptions & categories
		get_filtered_map<T>(ids: Set<number>, map: Map<number, T>): Map<number, T> {
			const filteredMap = new Map<number, T>()
			for (const id of ids) {
				const value = map.get(id)
				if (value) {
					filteredMap.set(id, value)
				}
			}
			return filteredMap
		},
	},
})
