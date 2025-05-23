import { axios_authenticatedFood, axios_incognito } from '@/services/axios';
import { c_MealInfo, PV } from '@/types';

class MealStorage {

	readonly #hash_name = 'hash';

	readonly #meal_name = 'meal';

	/// Delete hash and meals from the browser localStorage
	delete (): void {
		window.localStorage.removeItem(this.#hash_name);
		window.localStorage.removeItem(this.#meal_name);
	}

	/// Retrieve the all meals hash from local storage
	hash_get (): string | null {
		return window.localStorage.getItem(this.#hash_name);
	}

	/// Storage the all meals hash into local storage
	hash_set (latest_hash: string): void {
		if (latest_hash.length > 0) {
			mealModule().set_hash(latest_hash);
			window.localStorage.setItem(this.#hash_name, latest_hash);
		}
	}

	/// Attempt to retrieve jack meals from local storage
	/// Need to store as compressed, as maps don't stringify
	meals_get (): c_MealInfo | undefined {
		const meals = window.localStorage.getItem(this.#meal_name);
		if (meals) {
			try {
				const output = JSON.parse(meals);
				return output;
			} catch (_e) {
				window.localStorage.removeItem(this.#meal_name);
				return undefined;
			}
		}
	}

	/// Stringify jack meals and store in localstorage
	/// Need to store as compressed, as maps don't stringify
	meals_set (input: c_MealInfo): void {
		const input_json = JSON.stringify(input);
		window.localStorage.setItem(this.#meal_name, input_json);
	}

	async #get_set_meals_to_pinia (authenticated: boolean, current_meals?: c_MealInfo): PV {
		if (current_meals) {
			this.meals_set(current_meals);
			mealModule().set(current_meals);
		} else {
			const current_meals = authenticated ? await axios_authenticatedFood.all_get() : await axios_incognito.meals_get();
			this.meals_set(current_meals);
			mealModule().set(current_meals);
		}
	}

	/// Check hash and get meals, save to storage, else return and insert into pinia
	async seed_meal_pinia (): Promise<void> {
		loadingModule().set_loading(true);
		const authenticated = userModule().authenticated;
		const hash = this.hash_get();
		try {
			const latest_hash = authenticated ? await axios_authenticatedFood.mealhash_get() : await axios_incognito.mealhash_get();
			this.hash_set(latest_hash);
			if (hash && hash === latest_hash) {
				const meals_in_storage = this.meals_get();
				if (meals_in_storage) {
					await this.#get_set_meals_to_pinia(authenticated, meals_in_storage);
				} else {
					await this.#get_set_meals_to_pinia(authenticated);
				}
			} else {
				await this.#get_set_meals_to_pinia(authenticated);
			}
		} catch {
			const meals_in_storage = this.meals_get();
			if (meals_in_storage) await this.#get_set_meals_to_pinia(authenticated, meals_in_storage);
		}
		
		loadingModule().set_loading(false);
	}
}

export const mealStorage = new MealStorage();