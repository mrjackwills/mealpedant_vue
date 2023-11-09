<template>
	<v-app id='mealpedant' class=''>

		<NavMenu  v-if='init && mdAndDown || init && authenticated' :order='mdAndDown?"1":"2"' />
		<AppBar :order='mdAndDown?"2":"1"'/>
		
		<v-main
			class='d-flex align-center justify-center'
			v-touch='{
				left: () => toggleDrawer(true),
				right: () => toggleDrawer(false),
			}'
		>
		
			<router-view v-slot='{ Component }'>
				<component :is='Component' />
			</router-view>
			<TheDialog />
			<SnackBar />
		</v-main>

		<TheFooter />
	</v-app>
</template>

<script setup lang='ts'>
import { dexieDB } from '@/services/dexieDb';
import { snackError, snackSuccess } from '@/services/snack';
import { useHead } from '@vueuse/head';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { registerSW } from 'virtual:pwa-register';
import { useRoute } from 'vue-router';

import { useDisplay } from 'vuetify';
const { mdAndDown } = useDisplay();

onBeforeMount(async () => {
	loading.value = true;
	await browserHasIndexedDB();
	if (authenticated.value) await dexieDB.check_last_id();
	appReady.value = true;
	loading.value = false;
});

const appReady = ref(false);

const authenticated = computed(() => userModule().authenticated);
const init = computed(() => browserModule().init);

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const browserHasIndexedDB = async (): Promise<void> => {
	try {
		const dbname = 'testDb';
		const test_db = window.indexedDB.open(dbname);
		test_db.onerror = async () : Promise<void> => {
			await userModule().clientSideSignout();
			snackError({ message: 'IndexDB not available on your browser', closable: false });
			window.indexedDB.deleteDatabase(dbname);
		};
		window.indexedDB.deleteDatabase(dbname);
	}
	catch (e) {
		snackError({ message: 'IndexDB error', closable: false });

	}
};

const toggleDrawer = (status: boolean): void => {
	if (mdAndDown.value) drawerModule().set_open(status);
};

const { updateServiceWorker } = useRegisterSW();

if ('serviceWorker' in navigator) {
	registerSW({
		onNeedRefresh () {
			appUpdate();
		}
	});
}

const title = computed(() => {
	return browserModule().pageTitle;
});

const description = computed(() => {
	return browserModule().description;
});

const route = useRoute();

useHead({
	title: () => {
		const mp = 'Meal Pedant';
		if (title.value.length > 0) {
			return `${mp} - ${title.value}`;
		} else {
			return mp;
		}
	},

	meta: [
		{
			name: `description`,
			content: (): string => {
				if (description.value) {
					return description.value;
				} else {
					return `A meticulous daily log of ingestion`;
				}
			}
		}
	],
	link: () => [ { rel: 'canonical', href: `https://www.mealpedant.com${route?.path}` } ]
});

const appUpdate = (): void => {
	snackSuccess({
		message: 'Downloading Updates',
		loading: true,
		timeout: 4500,
	});
	window.setTimeout(() => updateServiceWorker(), 5000);
	
};

</script>
