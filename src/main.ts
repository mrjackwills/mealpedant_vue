import '@/vanillaTS/registerServiceWorker';
import { createPinia, PiniaVuePlugin } from 'pinia';
import { router } from '@/router';
import App from '@/App.vue';
import Meta from 'vue-meta';
import Vue, { VNode } from 'vue';
import Vuelidate from 'vuelidate';
import vuetify from '@/plugins/vuetify';

const pinia = createPinia();
Vue.use(PiniaVuePlugin);
Vue.use(Meta);
Vue.use(Vuelidate);

Vue.config.devtools = process.env.NODE_ENV === 'development' ? true : false;
Vue.config.productionTip = false;

new Vue({
	router,
	pinia,
	vuetify,
	render: (h): VNode => h(App)
}).$mount('#meal-pedant');