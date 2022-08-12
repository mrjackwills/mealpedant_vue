<template>
	<v-app id='mealpedant' container--fluid fill-height class='ma-0 vh-fix'>
		<app-app-bar />
		<app-dialog />
		<app-nav-menu v-if='init && $vuetify.breakpoint.smAndDown || init && authenticated' />
		<app-snackbar />
	
		<v-main
			v-touch='{
				left: () => toggleDrawer(true),
				right: () => toggleDrawer(false),
			}'
		>
			<transition
				v-if='appReady'
				:name='pwa ? "" : "fade"'
				mode='out-in'
			>
				<router-view />
			</transition>
			<!-- <app-footer v-if='!authenticated && $vuetify.breakpoint.mdAndUp' />
			 -->
		</v-main>
		<app-footer />
	</v-app>
</template>

<script lang='ts'>
import { browserModule, drawerModule, loadingModule, userModule } from '@/store';
import { dexieDB } from '@/services/dexieDB';
import { mapStores } from 'pinia';
import { mdiLanDisconnect, mdiWifiStrengthAlertOutline } from '@mdi/js';
import { snackSuccess, snackError } from '@/services/snack';
import AppBar from '@/components/Nav/AppBar.vue';
import debounce from 'lodash/debounce';
import NavMenu from '@/components/Nav/NavMenu.vue';
import Snackbar from '@/components/Snackbar.vue';
import TheDialog from '@/components/TheDialog.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'main-app',

	components: {
		appFooter: () => import(/* webpackChunkName: "f"*/ /* webpackMode: "lazy" */ '@/components/Footer/Footer.vue'),
		appAppBar: AppBar,
		appNavMenu: NavMenu,
		appSnackbar: Snackbar,
		appDialog: TheDialog,
	},

	async beforeMount () {
		this.loading = true;
		await this.browserHasIndexedDB();
		if (this.authenticated) await dexieDB.check_last_id();
		this.appReady = true;
		this.loading = false;
	},

	computed: {
		...mapStores(browserModule),

		init (): boolean {
			return this.browserStore.init;
		},
		authenticated (): boolean {
			return userModule().authenticated;
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		online (): boolean {
			return this.browserStore.online;
		},
		pwa: {
			get: function (): boolean {
				return this.browserStore.pwa;
			},
			set: function (b: boolean): void {
				this.browserStore.set_pwa(b);
			}
		},
	},

	created () {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const nav = window.navigator as any;
		const isInStandaloneMode = (): boolean => window.matchMedia('(display-mode: standalone)').matches || nav.standalone || document.referrer.includes('android-app://');
		
		if (isInStandaloneMode()) this.pwa = true;

		// Add event listeners for service worker events
		document.addEventListener('updateEvent', this.appUpdate);
		document.addEventListener('offlineEvent', this.appOffline);

		// Prevent Chrome 67 and earlier from automatically showing the prompt
		document.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
		});
	},

	data: () => ({
		mdiLanDisconnect,
		mdiWifiStrengthAlertOutline,
		appReady: false,
		
	}),

	destroyed () {
		document.removeEventListener('updateEvent', this.appUpdate);
		document.removeEventListener('offlineEvent', this.appOffline);
	},
	
	metaInfo: {
		/**
		 ** Dynamic page titles
		 * @param {string} titleChunk suffix to `Meal Pedant - ` if true
		 */
		titleTemplate: (titleChunk): string => titleChunk ? `Meal Pedant - ${titleChunk}` : 'Meal Pedant'
	},
	
	methods: {

		appOffline (): void {
			snackError({ message: 'No internet connection found' });
		},

		/**
		 ** If recieve updateEvent from service work, snack screen and reload page after timeout
		 */
		appUpdate (): void {
			// Maybe only snack if logged in?
			snackSuccess({ message: 'Downloading the latest version of Meal Pedant', loading: true, timeout: 4500, type: 'info', closable: false });
			setTimeout(() => window.location.reload(), 5000);
		},

		/**
		 ** Check if indexedDB is accessable, mainly focussed on firefox incognito mode
		 */
		async browserHasIndexedDB (): Promise<void> {
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
			}
		},

		setViewHeight (): void {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vh', `${vh}px`);
		},

		/**
		 ** Open or close nav drawer due to touch events
		 * @param {boolean} status open on true, close on false
		 */
		toggleDrawer (status: boolean): void {
			if (this.$vuetify.breakpoint.lgAndUp) return;
			drawerModule().set_open(status);
		},
	},

	mounted () {
		this.setViewHeight();

		const debouncedSetHeight = debounce(this.setViewHeight, 50);

		window.addEventListener('resize', debouncedSetHeight);

		this.$once('destroyed', () => {
			window.removeEventListener('resize', debouncedSetHeight);
		});
	},
});
</script>

<style scoped lang="scss">

.vh-fix ::v-deep .v-application--wrap {
	min-height: 100vh;
	min-height: calc(var(--vh, 100vh) * 100);
}
</style>