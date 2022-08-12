<template>
	<v-footer
		absolute
		app
		color='transparent'
		inset
	>
		<v-row justify='center' align='center' class='py-0 ma-0 no-gutters'>
			<v-col cols='auto' class='py-0 ma-0 no-gutters'>
				<transition name='snack-fade' >
					<v-row justify='center' align='center' class='no-gutters ma-0 pa-0'>

						<v-col cols='auto' class='no-gutters unselectable ma-0 pa-0'>
				
							<v-chip
								:ripple='false'
								class='not-cl elevation-0 black--text'
								color='offwhite'
								:small='$vuetify.breakpoint.mdAndDown'
								pill
							>
								<section v-if='showBuild' class='text-caption' @click='buildInfo'>
									<span>api: {{ apiVersion }}</span>
									<span class='ml-1'>site: {{ appVersion }}</span>
									<span class='ml-1'>built: {{ buildDate }}</span>
								</section>

								<section v-else>
									<template>
										<a :href='href' target='_blank' rel='noopener noreferrer'>
											<v-icon color='black' class='m1-2' :small='$vuetify.breakpoint.mdAndDown'>
												{{ mdiGithub }}
											</v-icon>
										</a>
									</template>
									<span @click='buildInfo'>
										mrjackwills 2015-
									</span>
								</section>
					
							</v-chip>
						</v-col>
					</v-row>
				</transition>
			</v-col>
		</v-row>
	</v-footer>
</template>

<script lang='ts'>

import Vue from 'vue';

import { mapStores } from 'pinia';
import { userModule, browserModule } from '@/store';
import { mdiGithub } from '@mdi/js';
import { env } from '@/vanillaTS/env';

export default Vue.extend({
	name: 'footer-component',

	async beforeDestroy () {
		clearTimeout(this.buildTimeout);
	},

	computed: {
		...mapStores(userModule),
		
		apiVersion (): string {
			return browserModule().api_version;
		},
		href (): string {
			return env.github.split('mealpedant')[0] ?? '';
		},

		inset () :bool {
			return this.$vuetify.breakpoint.mdAndUp;
		}
	},

	data: () => ({
		appVersion: env.app_version,
		buildDate: env.build_date,
		buildTimeout: 0,
		showBuild: false,
		mdiGithub
	}),

	methods: {
		/**
		 ** Show build date on version number click if authed
		 */
		buildInfo (): void {
			this.showBuild = !this.showBuild;
			clearTimeout(this.buildTimeout);
			this.buildTimeout = window.setTimeout(() => {
				this.showBuild = false;
			}, 10000);
		},
	},

});
</script>

<style scoped>
.lowercase-button{
	text-transform: lowercase;
}

a {
	color: #000000!important;
}
</style>