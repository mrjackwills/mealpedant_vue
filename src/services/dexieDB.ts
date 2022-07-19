import { axios_authenticatedFood } from '@/services/axios';
import { mealsModule, categoriesModule } from '@/store';
import {
	PV,
	su,
	TCategory,
	TIndexDBDateMeal,
	TInsert,
	TLastId,
	TPiniaDateMeal,
} from '@/types';
import Dexie from 'dexie';

class CreateDB extends Dexie {
	category: Dexie.Table<TCategory, number>;
	dateMeal: Dexie.Table<TIndexDBDateMeal, number>;
	last_id: Dexie.Table<TLastId, number>;

	constructor () {
		super('mealpedant_ts_rust');
		this.version(1).stores({
			category: '++',
			dateMeal: '++',
			last_id: '++'
		});
		this.last_id = this.table('last_id');
		this.category = this.table('category');
		this.dateMeal = this.table('dateMeal');
	}
}

const db = new CreateDB();

class DexieDB {
	
	async #cleanInsert (x: TInsert): PV {
		if (!x.data) throw Error('no data');
		if (!x.table_name) throw Error('no table');
		await db[x.table_name].clear();
		switch (x.table_name) {
		case 'last_id':
			await db.last_id.add(x.data);
			break;
		case 'category':
			await db.category.bulkAdd(x.data);
			break;
		case 'dateMeal':
			await db.dateMeal.bulkAdd(x.data);
			break;
		}
	}
	
	async clear_all () : PV {
		await Promise.all([
			db.category.clear(),
			db.dateMeal.clear(),
			db.last_id.clear(),
		]);
	}

	// Join categories and meals into a new object, id: '10' => id: "PASTA"
	async #mergeCategoryAndMeal (): Promise<Array<TPiniaDateMeal>> {
		const meals = await db.dateMeal.toArray();
		const categories = await db.category.toArray();
		const output: Array<TPiniaDateMeal>= [];
		for (const i of meals) {
			const row: TPiniaDateMeal = {
				da: i.da,
			};
			if (i.D) {
				const daveIndex = categories.findIndex((x) => String(x.id) === String(i.D.c));
				const daveCategory = categories[daveIndex]?.c ?? '';
				row.D = {
					...i.D,
					c: daveCategory
				};
			}
			if (i.J) {
				const jackIndex = categories.findIndex((x) => String(x.id) === String(i.J.c));
				const jackCategory = categories[jackIndex]?.c ?? '';
				row.J = {
					...i.J,
					c: jackCategory
			
				};
			}
			output.push(row);
		}
		return output;
	}

	// Should this be private?
	async mealsToPinia (): PV {
		const data = await this.#mergeCategoryAndMeal();
		mealsModule().set_meals(data);
	}

	async original_number_days (): Promise<number> {
		const meals = await db.dateMeal.toArray();
		return meals.length;
	}

	async original_number_meals (): Promise<number> {
		let total = 0;
		const meals = await db.dateMeal.toArray();
		for (const i of meals) {
			if (i.D) total++;
			if (i.J) total++;
		}
		return total;
	}

	// Should this be private?
	async categoryToPinia (): PV {
		const data = await db.category.toArray();
		categoriesModule().set_categories(data);
	}

	async getDBlast_id (): Promise<su> {
		const idArray = await db.last_id.toArray();
		return idArray[0];
	}

	async check_last_id (): PV {
		const current_id = await this.getDBlast_id();
		const server_id = await axios_authenticatedFood.last_get();
		if (server_id && current_id !== server_id) {
			const meals = await axios_authenticatedFood.all_get();
			const categories = await axios_authenticatedFood.category_get();
			await this.#cleanInsert({ table_name: 'last_id', data: server_id });
			await this.#cleanInsert({ table_name: 'category', data: categories });
			await this.#cleanInsert({ table_name: `dateMeal`, data: meals });
		}
		await this.seedPinia();
	}

	async seedPinia (): PV {
		await this.mealsToPinia();
		await this.categoryToPinia();
	}
}

export const dexieDB = new DexieDB();