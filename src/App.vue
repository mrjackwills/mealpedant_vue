<template>
	<v-app id='mealpedant' class='' ref='swipe'>

		<NavMenu v-if='init && mdAndDown || init && authenticated' :order='mdAndDown?"1":"2"' />
		<AppBar :order='mdAndDown?"2":"1"'/>
		<v-main
			class='d-flex align-center justify-center'
			
		>
			<router-view v-slot='{ Component }'>
				<component :is='Component' />
				<TheFooter />
				<SnackBar />
			</router-view>
			<TheDialog />
		</v-main>

	</v-app>
</template>

<script setup lang='ts'>
import { dexieDB } from '@/services/dexieDb';
import { snackError, snackSuccess } from '@/services/snack';
import { useHead } from '@vueuse/head';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { registerSW } from 'virtual:pwa-register';
import { useRoute } from 'vue-router';
import { useSwipe } from '@vueuse/core';

import { useDisplay } from 'vuetify';
const { mdAndDown } = useDisplay();

const { updateServiceWorker } = useRegisterSW();

const check_pwa = (): void => {
	// TODO put this in on mounted?
	if ('serviceWorker' in navigator) {
		registerSW({
			onNeedRefresh () {
				appUpdate();
			}
		});
	}
};

onBeforeMount(async () => {
	loading.value = true;
	await browserHasIndexedDB();
	if (authenticated.value) await dexieDB.check_last_id();
	appReady.value = true;
	loading.value = false;
	check_pwa();
});

const drawStore = drawerModule();

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

const swipe = ref<HTMLElement | null>(null);
const { isSwiping, direction } = useSwipe(swipe);
watch(isSwiping, (i) => {
	if (i && mdAndDown.value) {
		if (direction.value === 'right') {
			drawStore.set_open(false);
		} else if (direction.value === 'left') {
			drawStore.set_open(true);
		}
	}
});

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