<template>
	<v-app id='mealpedant' ref='swipe' class=''>
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
import { useSwipe } from '@vueuse/core'
import { useHead } from '@vueuse/head'
import { registerSW } from 'virtual:pwa-register'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { axios_incognito } from '@/services/axios'
import { snackSuccess } from '@/services/snack'

const { smAndDown } = useDisplay()
const { updateServiceWorker } = useRegisterSW()

const authenticated = computed(() => userModule().authenticated)
const description = computed(() => browserModule().description)
const drawStore = drawerModule()
const init = ref(false)
const route = useRoute()
const route_name = computed(() => router.currentRoute.value.name)
const router = useRouter()
const swipe = ref<HTMLElement | null>(null)
const title = computed(() => browserModule().pageTitle)

const { isSwiping, direction } = useSwipe(swipe)

function check_pwa (): void {
	if ('serviceWorker' in navigator) {
		registerSW({
			onNeedRefresh () {
				appUpdate()
			},
		})
	}
}
const service_interval = ref(0)

onBeforeMount(async () => {
	check_pwa()
	await axios_incognito.online_get()
	init.value = true
	service_interval.value = setInterval(check_pwa, 1000 * 60 * 20)
})

watch(isSwiping, (i: boolean) => {
	if (i && smAndDown.value) {
		if (direction.value === 'right') drawStore.set_open(false)
		else if (direction.value === 'left') drawStore.set_open(true)
	}
})

useHead({
	title: () => {
		const mp = 'Meal Pedant'
		return title.value.length > 0 ? `${mp} - ${title.value}` : mp
	},

	meta: [
		{
			name: `description`,
			content: (): string => {
				if (description.value) {
					return description.value
				}
				return `A meticulous daily log of ingestion`
			},
		},
	],
	link: () => [
		{
			rel: 'canonical',
			href: `https://www.mealpedant.com${route?.path}`,
		},
	],
})

function appUpdate (): void {
	snackSuccess({
		message: 'downloading updates',
		loading: true,
		timeout: 4500,
	})
	setTimeout(() => updateServiceWorker(), 5000)
}

</script>
