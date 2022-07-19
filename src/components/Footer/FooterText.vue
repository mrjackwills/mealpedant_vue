<template>
	<v-row justify='center' align='center' no-gutters class='ma-0 pa-0' >
		<v-expand-transition>
			<v-col v-if='showBuild && authed' cols='12' :order='3' class='text-caption text-center' >
				<v-tooltip class='' attach='#bdtt' top v-model='tooltip_date' color='black'>
					<template v-slot:activator='{ on }' >
						<div v-on='on' ></div>
					</template>
					<div >site build date</div>
				</v-tooltip>
				<div
					id='bdtt'
					class='mt-1'
					@mouseover='tooltip_date = true'
					@mouseleave='tooltip_date = false'
				>
					{{ buildDate }}
				</div>

				<v-tooltip attach='#apitt' top v-model='tooltip_api' color='black'>
					<template v-slot:activator='{ on }' >
						<div v-on='on' ></div>
					</template>
					<span>api version</span>
				</v-tooltip>
				<div
					id='apitt'
					class='mt-1'
					@mouseover='tooltip_api = true'
					@mouseleave='tooltip_api = false'
				>
					{{ api_version }}
				</div>

			</v-col>
		</v-expand-transition>
		<v-col cols='12' :md='authed? "12":"auto"' :order='appOrder' class='text-caption text-center' :class='authedMargin' @click='buildInfo'>

			<v-tooltip
				v-if='authed'
				v-model='tooltip_siteVersion'
				attach='#sv'
				color='black'
				top
			>
				<template v-slot:activator='{ on }' >
					<div v-on='on' ></div>
				</template>
				<span>site version</span>
			</v-tooltip>
			<div
				id='sv'
				@mouseover='tooltip_siteVersion = true'
				@mouseleave='tooltip_siteVersion = false'
			>
				{{ appVersion }}
			</div>
		</v-col>
		<v-col cols='12' md='auto' order='2' order-md='1' class='text-caption text-center' :class='authedMargin' @click='buildInfo'>
			<v-row class='no-gutters' align='center' justify='center'>
				<v-col class='' cols='auto' :order='copyrightOrder' :class='copyrightMargin'>
					<v-icon style='vertical-align: middle;' white x-small dense > {{ mdiCopyright }}</v-icon>
				</v-col>
				<v-col class='' :order='yearOrder' cols='auto' >
					Meal Pedant {{ year }}
				</v-col>
			</v-row>
		</v-col>
		<v-col cols='12' order='2' order-md='1' class='text-caption text-center' :class='authedMargin' >
			<a :href='github_repo' target='_blank' rel='noopener noreferrer' class='text-caption white--text'>
				<v-row class='no-gutters' align='center' justify='center'>
					<v-col class='' cols='auto' :class='copyrightMargin'>
						<v-icon style='vertical-align: middle;' white x-small dense > {{ mdiGithub  }}</v-icon>
					</v-col>
					<v-col class='' cols='auto' >
						source code
					</v-col>
				</v-row>
			</a>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { browserModule, userModule } from '@/store';
import { env } from '@/vanillaTS/env';
import { mdiCopyright, mdiGithub } from '@mdi/js';
import { su } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'app-footer-text',

	async beforeDestroy () {
		clearTimeout(this.buildTimeout);
	},
	
	computed: {
		api_version (): su {
			return browserModule().api_version;
		},
		appOrder (): string {
			return this.authed || this.$vuetify.breakpoint.mdAndUp ? '1' : '2';
		},
		appVersion (): string {
			return env.app_version;
		},
		authed (): boolean {
			return userModule().authenticated;
		},
		authedMargin (): string {
			return this.authed ? 'py-0' : 'pa-1';
		},
		buildDate (): string {
			return env.build_date;
		},
		copyrightOrder (): string {
			return this.$vuetify.breakpoint.mdAndUp && !this.authed ? '2' : '1' ;
		},
		copyrightMargin (): string {
			return this.$vuetify.breakpoint.smAndDown ? 'mr-1' : 'mx-1';
		},
		github_repo (): string {
			return env.github;
		},
		year (): number {
			return new Date().getUTCFullYear();
		},
		yearOrder (): string {
			return this.$vuetify.breakpoint.mdAndUp ? '1' : '2';
		}
	},

	data: () => ({
		showBuild: false,
		buildTimeout: 0,
		tooltip_api: false,
		tooltip_date: false,
		tooltip_siteVersion: false,
		mdiCopyright,
		mdiGithub
	}),

	methods: {
		buildInfo (): void {
			if (!this.authed) return;
			clearTimeout(this.buildTimeout);
			this.showBuild = !this.showBuild;
			this.buildTimeout = setTimeout(() => {
				this.showBuild = false;
			}, 20000);
		},
	},
	
});
</script>

<style>
.v-tooltip__content {
	font-size: 11px !important;
	padding: 2px 6px 2px 6px!important;
}
</style>