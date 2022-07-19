<template>
	<v-navigation-drawer
		app
		v-model='drawer'
		:right='smallScreen'
		:mini-variant='minivariant'
		clipped
		mobile-breakpoint='960'
		width='175'
		height='100vh'
	>
		<v-list v-if='init'>
			<section class='hidden-md-and-up'>
				<v-list-item @click='drawer=!drawer'>
					<v-list-item-action>
						<v-icon>{{ mdiClose }}</v-icon>
					</v-list-item-action>
					<v-list-item-title class='text-uppercase'>close</v-list-item-title>
				</v-list-item>
				<v-divider class='mt-2 mb-2' />
			</section>
			<section v-if='!authed' >
				<v-list-item class='hidden-md-and-up' v-for='(item, index) in registerLinks' :key='`drt${index}`' router :to='item.route' >
					<v-list-item-action>
						<v-icon>{{ item.icon }}</v-icon>
					</v-list-item-action>
					<v-list-item-title class='text-lowercase'>{{ item.text }}</v-list-item-title>
				</v-list-item>
			</section>
			<section v-if='authed'>
				<v-list-item v-for='(item, index) in drawerLinks' :key='`dr${index}`' router :to='item.route'>
					<v-list-item-action>
						<v-icon >{{ item.icon }}</v-icon>
					</v-list-item-action>
					<v-list-item-title class='text-lowercase'>{{ item.text }}</v-list-item-title>
				</v-list-item>
				<section v-if='admin'>
					<v-list-item v-for='(item, index) in adminLinks' :key='`al${index}`' router :to='item.route'>
						<v-list-item-action>
							<v-icon>{{ item.icon }}</v-icon>
						</v-list-item-action>
						<v-list-item-title class='text-lowercase'>{{ item.text }}</v-list-item-title>
					</v-list-item>
				</section>
				<v-list-item class='cl ' @click='minivariant=!minivariant' v-if='!smallScreen' >
					<v-list-item-action>
						<v-icon>{{ minivariantIcon }}</v-icon>
					</v-list-item-action>
					<v-list-item-title class='text-lowercase'>minimize<span v-intersect='onIntersect' /></v-list-item-title>
				</v-list-item>
				<v-divider :class='{"dividermargin": $vuetify.breakpoint.lgAndUp, "mt-2 mb-2" : $vuetify.breakpoint.mdAndDown}' />
				<v-list-item class='cl' @click='signout' >
					<v-list-item-action>
						<v-icon >{{ mdiPower }}</v-icon>
					</v-list-item-action>
					<v-list-item-title class='text-uppercase'>sign-out</v-list-item-title>
				</v-list-item>
				<v-row align='center' justify='center' v-if='$vuetify.breakpoint.mdAndDown && !minivariant' class='mt-4'>
					<v-col >
						<div class='text-center smalltext'>{{ userEmail }}</div>
					</v-col>
				</v-row>
			</section>
		</v-list>
		<v-list v-else>
			<v-row class='pa-0 ma-0' align='center' justify='center'>
				<v-col cols='auto' class='pa-0 ma-0'>
					<v-progress-circular
						color='primary'
						indeterminate
					/>
				</v-col>
			</v-row>
		</v-list>
		<template  v-slot:append  v-if='!minivariant'>
			<div v-if='isIntersecting'>
				<app-footer-text />
			</div>
		</template>
	</v-navigation-drawer>
</template>

<script lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
import { browserModule, drawerModule, userModule } from '@/store';
import {
	mdiAccountCircle,
	mdiAccountPlus,
	mdiChevronLeft,
	mdiChevronRight,
	mdiClose,
	mdiCog,
	mdiDeleteSweep,
	mdiFormatListBulleted,
	mdiLogin,
	mdiPlusCircle,
	mdiPower,
} from '@mdi/js';
import { su } from '@/types';
import FooterText from '@/components/Footer/FooterText.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'app-nav-menu',

	components: {
		appFooterText: FooterText,
	},

	computed: {
		admin (): boolean {
			return userModule().admin;
		},
		authed (): boolean {
			return userModule().authenticated;
		},
		drawer: {
			get: function (): boolean {
				return drawerModule().open;
			},
			set: function (b: boolean): void {
				drawerModule().set_open(b);
			}
		},
		init (): boolean {
			return browserModule().init;
		},
		minivariant: {
			get: function (): boolean {
				return drawerModule().mini;
			},
			set: function (b: boolean): void {
				drawerModule().set_mini(b);
			}
		},
		minivariantIcon (): string {
			return this.minivariant ? this.mdiChevronRight : this.mdiChevronLeft;
		},
		smallScreen (): boolean {
			return this.$vuetify.breakpoint.smAndDown;
		},
		userEmail (): su {
			return userModule().email;
		},
	},

	created () {
		if (!this.smallScreen && this.authed) this.drawer = true;
	},
	
	data: () => ({
		drawerLinks: [
			{
				icon: mdiFormatListBulleted,
				text: 'meals',
				route: '/meals'
			},
			{
				icon: mdiAccountCircle,
				text: 'settings',
				route: '/settings'
			},
		],
		adminLinks: [
			{
				icon: mdiPlusCircle,
				text: 'add meal',
				route: '/addmeal'
			},
			{
				icon: mdiCog,
				text: 'admin',
				route: '/admin'
			},
			{
				icon: mdiDeleteSweep,
				text: 'flush cache',
				route: '/flushcache'
			},
		],
		registerLinks: [
			{
				icon: mdiAccountPlus,
				text: 'register',
				route: '/register'
			},
			{
				icon: mdiLogin,
				text: 'sign-in',
				route: '/signin'
			},
		],
		isIntersecting: false,
		mdiChevronLeft,
		mdiChevronRight,
		mdiClose,
		mdiPower
	}),

	methods: {
		/**
		 ** Sign out via pinia
		 */
		async signout (): Promise<void> {
			this.minivariant = false;
			await userModule().clientSideSignout();
			await axios_authenticatedUser.signout_post();
		},

		onIntersect (entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void {
			this.isIntersecting = !!entries[0]?.isIntersecting;
		},
	},

	watch: {
		// Watch small screen, set nav mini variant to false if so
		smallScreen (b: boolean): void {
			if (b) this.minivariant = false;

		}
	},
});
</script>

<style>

.minivariantmargintop {
	margin-top: 5rem;
}

.dividermargin {
	margin-top: 2.5rem;
	margin-bottom: 2.5rem;
}

</style>