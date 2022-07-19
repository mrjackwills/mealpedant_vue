<template>
	<v-container container--fluid fill-height v-if='pageInit'>
		<v-row class='ma-0 pa-0' align='center' justify='center'>
			<v-col cols='11' class='ma-0 pa-0'>
				<app-two-f-a />
			</v-col>
			<v-col cols='11' class='pa-0' v-if='!setupProcessStarted && !backupProcess'>
				<v-row justify='center' class='no-gutters my-3'>
					<v-col cols='12' sm='8' md='6'>
						<v-divider />
					</v-col>
				</v-row>
			</v-col>
			<v-col cols='11' class='ma-0 pa-0 mb-8' v-if='!setupProcessStarted && !backupProcess'>
				<app-change-password />
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { loadingModule, twoFAModule } from '@/store';
import { MetaInfo } from 'vue-meta';
import ChangePassword from '@/components/Settings/ChangePassword.vue';
import TwoFA from '@/components/Settings/TwoFactor.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'settings-page',

	async beforeMount () {
		this.loading = true;
		await axios_authenticatedUser.authenticated_get();
		this.pageInit = true;
		this.loading = false;
	},

	components: {
		appChangePassword: ChangePassword,
		appTwoFA: TwoFA,
	},

	computed: {
		backupProcess (): boolean {
			return twoFAModule().backupProcess;
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		setupProcessStarted (): boolean {
			return twoFAModule().setupProcessStarted;
		}
	},
	
	data: () => ({
		pageTitle: 'Settings',
		pageInit: false,
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},
});
</script>