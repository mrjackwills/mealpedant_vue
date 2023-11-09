<template>
	<v-navigation-drawer
		v-model='drawer'
		:location='mobile?"right":"left"'
		:rail='minivariant'
		:mobile-breakpoint='960'
		height='100vh'
		width='175'
		app
		touchless
		color='navmenu'
	>
		<v-list v-if='init'>
			<section v-if='mobile'>

				<v-list-item @click='(drawer=!drawer)' class='cl'>
					<template v-slot:prepend>
						<v-icon :icon='mdiClose' class='flipx' />
					</template>
					<template v-slot:title>
						<span class='ml-2'>close</span>
					</template>
				</v-list-item>
				<v-divider class='mt-2 mb-2' />
			</section>
			<section v-if='!authed && mobile' >
				<v-list-item  v-for='(item, index) in registerLinks' :key='`drt${index}`' router :to='item.route' >
					<template v-slot:prepend  >
						<v-icon :icon='item.icon'  class='ma-0 pa-0'/>
					</template>
					<template v-slot:title>
						<span class=''>{{ item.text }}</span>
					</template>
				</v-list-item>
			</section>
			<section v-if='authed'>

				<v-list-item v-for='(item, index) in drawerLinks' :key='`dr${index}`' router :to='item.route'>
					<template v-slot:prepend  >
						<v-icon :icon='item.icon'  class='ma-0 pa-0'/>
					</template>
					<template v-slot:title>
						<span class=''>{{ item.text }}</span>
					</template>
				</v-list-item>

				<section v-if='admin'>

					<v-list-item v-for='(item, index) in adminLinks' :key='`al${index}`' router :to='item.route'>
						<template v-slot:prepend  >
							<v-icon :icon='item.icon'  class='ma-0 pa-0'/>
						</template>
						<template v-slot:title>
							<span class=''>{{ item.text }}</span>
						</template>
					</v-list-item>

				</section>

				<v-list-item class='cl ' @click='minivariant=!minivariant' v-if='!mobile'>
					<template v-slot:prepend  >
						<v-icon :icon='minivariantIcon'  class='ma-0 pa-0'/>
					</template>
					<template v-slot:title>
						<span class=''>minimize</span>
					</template>
				</v-list-item>
					
				<v-divider :class='{"dividermargin": lgAndUp, "mt-2 mb-2" : mdAndDown}' />

				<v-list-item class='cl' @click='signout'>
					<template v-slot:prepend  >
						<v-icon :icon='mdiPower' class='ma-0 pa-0'/>
					</template>
					<template v-slot:title>
						<span  class='text-uppercase'>sign-out</span>
					</template>
				</v-list-item>
				
				<v-row align='center' justify='center' v-if='mobile && !minivariant' class='mt-4'>
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
	</v-navigation-drawer>
</template>

<script setup lang='ts'>
import { axios_authenticatedUser } from '@/services/axios';
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
import type { su } from '@/types';
import { useDisplay } from 'vuetify';
import { FrontEndRoutes } from '@/types/enum_routes';
const { lgAndUp, mdAndDown } = useDisplay();

const [ drawStore, userStore ] = [ drawerModule(), userModule() ];

const mobile = computed(() : boolean => {
	return mdAndDown.value;
});

const admin = computed((): boolean => {
	return userStore.admin;
});
const authed = computed((): boolean => {
	return userStore.authenticated;
});
const drawer = computed({
	get (): boolean {
		return drawStore.open;
	},
	set (b: boolean): void {
		drawStore.set_open(b);
	}
});
const init = computed((): boolean => {
	return browserModule().init;
});
const minivariant = computed({
	get (): boolean {
		return drawStore.mini;
	},
	set (b: boolean): void {
		drawStore.set_mini(b);
	}
});
const minivariantIcon = computed((): string => {
	return minivariant.value ? mdiChevronRight : mdiChevronLeft;
});
const userEmail = computed((): su => {
	return userStore.email;
});

onMounted(() => {
	if (!mobile.value && authed.value) drawer.value = true;
});

const drawerLinks = [
	{
		icon: mdiFormatListBulleted,
		text: 'meals',
		route: FrontEndRoutes.MEALS
	},
	{
		icon: mdiAccountCircle,
		text: 'settings',
		route: FrontEndRoutes.SETTINGS
	},
];
const adminLinks = [
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
		route: FrontEndRoutes.FLUSH_CACHE,
	},
];
const registerLinks = [
	{
		icon: mdiAccountPlus,
		text: 'register',
		route: FrontEndRoutes.REGISTER
	},
	{
		icon: mdiLogin,
		text: 'sign-in',
		route: FrontEndRoutes.SIGNIN
	},
];

/**
 ** Sign out via pinia
*/
const signout = async (): Promise<void> => {
	minivariant.value = false;
	await userModule().clientSideSignout();
	await axios_authenticatedUser.signout_post();
};

watch(mobile, (b) => {
	if (b) minivariant.value = false;
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

.v-list-item__spacer{
	width: 8px!important;
}

</style>