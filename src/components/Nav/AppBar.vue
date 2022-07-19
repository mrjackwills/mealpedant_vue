<template>
	<nav>
		<v-app-bar
			app
			:height='`${toolbarHeight}px`'
			flat
			clipped-left
		>
			<v-avatar
				@click='goHome'
				:size='`${toolbarHeight - 8}px`'
				tile
				class='cl mr-2'
			>
				<v-img
					src='@/assets/tile_svg.svg'
					:eager='true'
					id='topOfPage'
				/>
			</v-avatar>
			<v-toolbar-title @click='goHome' class='cl'>
				<span class='font-weight-bold' :class='navTitleFontSize' to='/'>Meal Pedant</span>
				<section class='hidden-sm-and-down mx-1'>
					<span class='font-weight-light font-italic tag-line text-subtitle-1'>&ldquo;A meticulous daily log of ingestion&rdquo;</span>
				</section>
			</v-toolbar-title>
			<v-spacer />
			<v-toolbar-items class='hidden-sm-and-down' v-if='!authed'>
				<v-btn text v-for='(item, index) in registerLinks' :key='`${index}`' :to='item.route'>
					<v-icon dark small class='mr-1'>{{ item.icon }}</v-icon>
					{{ item.text }}
				</v-btn>
			</v-toolbar-items>
			<v-toolbar-items class='hidden-md-and-down' v-if='authed'>
				<v-row align='center'>
					<v-col cols='auto' class='cl' @click='$router.push(`/settings`).catch(err => {})'>
						{{ userEmail }}
					</v-col>
				</v-row>
			</v-toolbar-items>
			<v-toolbar-items class='hidden-md-and-up mr-xs-4 '>
				<v-row class='no-gutters' justify='center' align='center'>
					<v-col cols='auto'>
						<v-icon class='' large @click='drawer=!drawer'>{{ mdiMenu }}</v-icon>
					</v-col>
				</v-row>
			</v-toolbar-items>
			<v-row
				v-if='!online'
				:class='alert_class'
				class='ma-0 pa-0'
				justify='end'
				slot='extension'
				dense
				no-gutters
			>
				<v-col cols='12' class='ma-0 pa-0'>
					<app-offline-row />
				</v-col>
			</v-row>
			<v-progress-linear
				:active='loading'
				:indeterminate='loading'
				absolute
				bottom
				color='primary'
				height='3'
			/>
		</v-app-bar>
	</nav>
</template>

<script lang='ts'>
import { browserModule, drawerModule, loadingModule, userModule } from '@/store';
import { mdiAccountPlus, mdiLogin, mdiMenu } from '@mdi/js';
import { su } from '@/types';
import OfflineRow from '@/components/OfflineRow.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'app-navbar',

	components: {
		appOfflineRow: OfflineRow,
	},
	
	computed: {
		alert_class (): string {
			return this.$vuetify.breakpoint.smAndDown? 'alert-bottom' : 'alert-top';
		},
		drawer: {
			get: function (): boolean {
				return drawerModule().open;
			},
			set: function (b: boolean): void {
				drawerModule().set_open(b);
			}
		},
		online (): boolean {
			return browserModule().online;
		},
		authed (): boolean {
			return userModule().authenticated;
		},
		loading (): boolean {
			return loadingModule().loading;
		},
		navTitleFontSize (): string {
			return this.$vuetify.breakpoint.smAndDown ? 'text-h5' : 'text-h4';
		},
		toolbarHeight (): number {
			return this.$vuetify.breakpoint.smAndDown ? 56 : 80;
		},
		userEmail (): su {
			return userModule().email;
		},
	},

	data: () => ({
		registerLinks: [
			{ icon: mdiAccountPlus, text: 'register', route: '/register' },
			{ icon: mdiLogin, text: 'sign-in', route: '/signin' },
		],
		mdiMenu
	}),

	methods: {
		/**
		 ** Clicking logo, navigation to home page depending on if authed or what page currently on
		 */
		goHome (): void {
			if (this.authed && this.$route.path !== '/meals') this.$router.push('/meals');
			else if (!this.authed && this.$route.path !== '/') this.$router.push('/');
		},
	},
	
});
</script>