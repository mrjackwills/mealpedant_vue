<template>
	<v-row justify='center' class='error cl' @click='goOnline'>
		<v-col cols='auto' class=''>
			<v-icon>{{ mdiWifiStrengthAlertOutline }}</v-icon>
		</v-col>
		<v-col cols='auto' class=''>
			offline
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { axios_authenticatedFood, axios_incognito } from '@/services/axios';
import { loadingModule, userModule } from '@/store';
import { mdiWifiStrengthAlertOutline } from '@mdi/js';
import { snackError } from '@/services/snack';
import Vue from 'vue';

export default Vue.extend({
	name: 'offline-row',

	beforeDestroy () {
		clearInterval(this.goOnlineInterval);
	},

	computed: {
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
	},

	data: () => ({
		goOnlineInterval: 0,
		mdiWifiStrengthAlertOutline,
	}),

	methods: {
		async goOnline (): Promise<void> {
			try {
				this.loading = true;
				await axios_incognito.online_get();
				if (this.authenticated) await Promise.all([
					axios_authenticatedFood.last_get(),
					axios_authenticatedFood.all_get(),
					axios_authenticatedFood.category_get(),
				]);
			} catch (e) {
				const message = e instanceof Error ? e.message : 'ERROR';
				snackError({ message });
			} finally {
				this.loading = false;
			}
		},
	},

	mounted () {
		this.goOnlineInterval = setInterval(() => this.goOnline(), 10000);
	},
	
});
</script>