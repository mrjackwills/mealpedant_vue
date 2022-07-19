import { dexieDB } from '@/services/dexieDB';
import { foodModule, selectorsModule, typesModule, loadingModule } from '@/store';

export const resetFilters = async (): Promise<void> => {
	const LoadingStore = loadingModule();
	LoadingStore.set_loading(true);
	await Promise.all([
		typesModule().$reset,
		foodModule().$reset(),
		selectorsModule().$reset()
	]);
	await dexieDB.seedPinia();
	LoadingStore.set_loading(false);
	// TODO remove all page params as well
};