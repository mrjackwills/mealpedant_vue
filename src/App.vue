<template>
	<v-app id='mealpedant' class='' ref='swipe'>
		<NavMenu v-if='smAndDown || authenticated' :order='smAndDown ? "1" : "2"' />
		<AppBar :order='smAndDown ? "2" : "1"' />
		<v-main class='d-flex align-center justify-center'>
			<router-view :key='route_name' />
			<TheFooter />
			<SnackBar />
			<UpArrow />
			<TheDialog />
		</v-main>
	</v-app>
</template>

<script setup lang='ts'>
import { snackSuccess } from '@/services/snack';
import { useHead } from '@vueuse/head';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { registerSW } from 'virtual:pwa-register';
import { useRoute } from 'vue-router';
import { useSwipe } from '@vueuse/core';
import { useDisplay } from 'vuetify';
import { axios_incognito } from '@/services/axios';

const { smAndDown } = useDisplay();
const { updateServiceWorker } = useRegisterSW();

const authenticated = computed(() => userModule().authenticated);
const description = computed(() => browserModule().description);
const drawStore = drawerModule();
const init = ref(false);
const route = useRoute();
const route_name = computed(() => router.currentRoute.value.name);
const router = useRouter();
const swipe = ref<HTMLElement | null>(null);
const title = computed(() => browserModule().pageTitle);

const { isSwiping, direction } = useSwipe(swipe);

// check for updates every x minutes using an interval?
const check_pwa = (): void => {
	if ('serviceWorker' in navigator) {
		registerSW({
			onNeedRefresh () {
				appUpdate();
			}
		});
	}
};

onBeforeMount(async () => {
	check_pwa();
	await axios_incognito.online_get();
	init.value = true;
});

watch(isSwiping, (i: boolean) => {
	if (i && smAndDown.value) {
		if (direction.value === 'right') drawStore.set_open(false);
		else if (direction.value === 'left') drawStore.set_open(true);
	}
});

useHead({
	title: () => {
		const mp = 'Meal Pedant';
		if (title.value.length > 0) return `${mp} - ${title.value}`;
		else return mp;
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
	link: () => [
		{
			rel: 'canonical',
			href: `https://www.mealpedant.com${route?.path}`
		}
	]
});

const appUpdate = (): void => {
	snackSuccess({
		message: 'downloading updates',
		loading: true,
		timeout: 4500
	});
	window.setTimeout(() => updateServiceWorker(), 5000);
};

</script>
