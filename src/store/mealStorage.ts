import type { c_MealInfo } from '@/types'
import { fetch_authenticatedFood, fetch_incognito } from '@/services/fetch'

class MealStorage {
	readonly #hash_name = 'hash'

	readonly #meal_name = 'meal'

	// Delete hash and meals from the browser localStorage
	delete (): void {
		window.localStorage.removeItem(this.#hash_name)
		window.localStorage.removeItem(this.#meal_name)
	}

	// Retrieve the all meals hash from local storage
	hash_get (): string | null {
		return window.localStorage.getItem(this.#hash_name)
	}

	// Storage the all meals hash into local storage
	hash_set (latest_hash: string): void {
		if (latest_hash.length > 0) {
			mealModule().set_hash(latest_hash)
			window.localStorage.setItem(this.#hash_name, latest_hash)
		}
	}

	/*
	 * Attempt to retrieve jack meals from local storage
	 * Need to store as compressed, as maps don't stringify
	 */
	meals_get (): c_MealInfo | undefined {
		const meals = window.localStorage.getItem(this.#meal_name)
		if (meals) {
			try {
				const output = JSON.parse(meals)
				return output
			} catch {
				window.localStorage.removeItem(this.#meal_name)
				return undefined
			}
		}
	}

	/*
	 * Stringify jack meals and store in localstorage
	 * Need to store as compressed, as maps don't stringify
	 */
	meals_set (input: c_MealInfo): void {
		const input_json = JSON.stringify(input)
		window.localStorage.setItem(this.#meal_name, input_json)
	}

	// Check hash and get meals, save to storage, else return and insert into pinia
	async seed_meal_pinia (): Promise<void> {
		try {
			loadingModule().set_loading(true)
			const authenticated = userModule().authenticated
			const latest_hash = authenticated ? await fetch_authenticatedFood.mealhash_get() : await fetch_incognito.mealhash_get()

			const hash = this.hash_get()
			if (hash && hash === latest_hash) {
				const cached = this.meals_get()
				if (cached) {
					this.#use_meals(cached)
					return
				}
			}

			const fetched = authenticated ? await fetch_authenticatedFood.all_get() : await fetch_incognito.meals_get()
			if (fetched) {
				this.#use_meals(fetched)
				// Only persist the hash once its matching meals are stored,
				// else stale meals get served as fresh on the next load
				if (latest_hash) {
					this.hash_set(latest_hash)
				}
			}
		} catch {
			const cached = this.meals_get()
			if (cached) {
				this.#use_meals(cached)
			}
		} finally {
			loadingModule().set_loading(false)
		}
	}

	// Write meals to localStorage and pinia
	#use_meals (meals: c_MealInfo): void {
		this.meals_set(meals)
		mealModule().set(meals)
	}
}

export const mealStorage = new MealStorage()
