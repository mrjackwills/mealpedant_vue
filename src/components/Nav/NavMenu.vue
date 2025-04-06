<template>
	<v-navigation-drawer v-model='drawer' :location='mobile ? "right" : "left"' :rail='mini' :mobile-breakpoint='960'
		color='navmenu' height='' id='nav_menu' width='150' app touchless>
		<v-list v-if='init' >
			<section v-if='mobile'>

				<v-list-item density='compact' @click='(drawer = !drawer)' class='cl'>
					<template v-slot:prepend>
						<v-icon :icon='mdiClose' size='small' class='flipx' />
					</template>
					<template v-slot:title>
						<span class='ml-2 text-body-2'>close</span>
					</template>
				</v-list-item>
				<v-divider class='' />
			</section>
			<section v-if='!authed && mobile'>
				<v-list-item density='compact' v-for='(item, index) in registerLinks' :key='`drt${index}`' router :to='item.route'>
					<template v-slot:prepend>
						<v-icon size='small' :icon='item.icon' class='ma-0 pa-0' />
					</template>
					<template v-slot:title>
						<span class='text-body-2'>{{ item.text }}</span>
					</template>
				</v-list-item>
			</section>
			<section v-if='authed'>

				<v-list-item density='compact' v-for='(item, index) in drawerLinks' :key='`dr${index}`' router :to='item.route'>
					<template v-slot:prepend>
						<v-icon size='small' :icon='item.icon' class='ma-0 pa-0' />
						<v-tooltip
							v-if='mini &&!mobile'
							activator='parent'
							location='end'
							:text='item.text'
						/>
					</template>
					<template v-slot:title>
						<span class='text-body-2' >{{ item.text }}</span>
					</template>
				</v-list-item>

				<section v-if='admin'>

					<v-list-item density='compact' v-for='(item, index) in adminLinks' :key='`al${index}`' router :to='item.route'>
						<template v-slot:prepend>
							<v-icon size='small' :icon='item.icon' class='ma-0 pa-0' />
							<v-tooltip
								v-if='mini &&!mobile'
								activator='parent'
								location='end'
								:text='item.text'
							/>
						</template>
						<template v-slot:title>
							<span class='text-body-2'>{{ item.text }}</span>
						</template>
					</v-list-item>

					<v-list-item density='compact' class='cl' @click='flushCache'>
						<template v-slot:prepend>
							<v-icon size='small' :icon='mdiDeleteSweep' class='ma-0 pa-0' />
							<v-tooltip
								v-if='mini &&!mobile'
								activator='parent'
								location='end'
								text='flush cache'
							/>
						</template>
						<template v-slot:title>
							<span class='text-body-2'>flush cache</span>
						</template>
					</v-list-item>
				</section>

				<v-list-item density='compact' class='cl ' @click='mini = !mini' v-if='!mobile' >
					<template v-slot:prepend>
						<v-icon size='small' :icon='minivariantIcon' class='ma-0 pa-0' />
						<v-tooltip
							v-if='mini &&!mobile'
							activator='parent'
							location='end'
							text='maxmize'
						/>
					</template>
					<template v-slot:title>
						<span class='text-body-2' >minimize</span>
					</template>
				</v-list-item>

				<v-divider class='my-2'/>

				<v-list-item density='compact' class='cl' @click='signout'>
					<template v-slot:prepend>
						<v-icon size='small' :icon='mdiPower' class='ma-0 pa-0' />
						<v-tooltip
							v-if='mini &&!mobile'
							activator='parent'
							location='end'
							text='sign out'
						/>
					</template>
					<template v-slot:title>
						<span class='text-body-2'>sign out</span>
					</template>
				</v-list-item>

			</section>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup lang='ts'>
import {
	mdiAccountCircle,
	mdiAccountPlus,
	mdiChevronLeft,
	mdiChevronRight,
	mdiClose,
	mdiCog,
	mdiDeleteSweep,
	mdiFood,
	mdiLogin,
	mdiPlusCircle,
	mdiPower
} from '@mdi/js';
import { useDisplay } from 'vuetify';
import { FrontEndRoutes } from '@/types/const_routes';
import { PV } from '@/types';
import { axios_admin } from '@/services/axios';
const { smAndDown } = useDisplay();

const [drawStore, userStore] = [drawerModule(), userModule()];

const mobile = computed(() => smAndDown.value);
const admin = computed(() => userStore.admin);
const authed = computed(() => userStore.authenticated);

const minivariantIcon = computed(() => mini.value ? mdiChevronRight : mdiChevronLeft);

const init = ref(false);
const drawer = computed({
	get (): boolean {
		return drawStore.open;
	},
	set (b: boolean): void {
		drawStore.set_open(b);
	}
});

const mini = computed({
	get (): boolean {
		return drawStore.mini;
	},
	set (b: boolean): void {
		drawStore.set_mini(b);
	}
});


const flushCache = async (): PV => {
	await axios_admin.cache_delete();
	if (mobile.value && drawer.value) drawer.value = false;
};
onBeforeMount(() => {
	if (!mobile.value && authed.value) {
		drawer.value = true;
		mini.value = false;
	}
	init.value = true;
});

const drawerLinks = [
	{
		icon: mdiFood,
		text: 'meals',
		route: FrontEndRoutes.MEALS
	},
	{
		icon: mdiAccountCircle,
		text: 'settings',
		route: FrontEndRoutes.SETTINGS
	}
];
const adminLinks = [
	{
		icon: mdiPlusCircle,
		text: 'add meal',
		route: FrontEndRoutes.ADDMEAL
	},
	{
		icon: mdiCog,
		text: 'admin',
		route: FrontEndRoutes.ADMIN
	}
];
const registerLinks = [
	{
		icon: mdiFood,
		text: 'meals',
		route: FrontEndRoutes.MEALS
	},
	{
		icon: mdiAccountPlus,
		text: 'register',
		route: FrontEndRoutes.REGISTER
	},
	{
		icon: mdiLogin,
		text: 'sign-in',
		route: FrontEndRoutes.SIGNIN
	}
];

/// Sign out via the pinia method
const signout = (): void => {
	mini.value = false;
	userModule().clientSideSignout();
	
};

</script>

<style>
.minivariantmargintop {
	margin-top: 5rem;
}

.v-list-item__spacer {
	width: 8px !important;
}

#nav_menu {
	min-height: 100vh;
}
</style>