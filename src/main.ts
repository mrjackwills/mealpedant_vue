import type { Router } from 'vue-router'
import { createHead } from '@vueuse/head'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// Composables
// Components
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'

const app = createApp(App)
const head = createHead()

declare module 'pinia' {
	export type Pinia = { router: () => Router }
	export type PiniaCustomProperties = { router: Router }
}

const pinia = createPinia()
pinia.use(({ store }) => {
	store.router = markRaw(router)
})
pinia.router = (): Router => router

pinia.use(piniaPluginPersistedstate)

app
	.use(head)
	.use(router)
	.use(vuetify)
	.use(pinia)
	.mount('#mealpedant_app')
