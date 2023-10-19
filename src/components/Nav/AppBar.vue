<template>
	<v-app-bar
		:extended='!online'
		:height='`${toolbarHeight}`'
		color='appbar'
		extension-height='40'
		app
		clipped-left
		flat
	>
		<v-avatar
			@click='goHome'
			:size='`${toolbarHeight - 8}px`'
			tile
			class='cl mx-2'
		>
			<v-img
				src='@/assets/tile_svg.svg'
				:eager='true'
				id='topOfPage'
			/>
		</v-avatar>
		<v-toolbar-title @click='goHome' class='cl'>
			<span class='font-weight-bold' :class='navTitleFontSize' FrontendRoutes.BASE>Meal Pedant</span>
			<section v-if='!mobile' class='mx-1'>
				<span class='font-weight-light font-italic tag-line text-subtitle-1'>"A meticulous daily log of ingestion"</span>
			</section>
		</v-toolbar-title>
		<v-spacer />
		<v-toolbar-items class='' v-if='!authed && !mobile'>
			<v-btn v-for='(item, index) in registerLinks' :key='`${index}`' :to='item.route'>
				<v-icon dark small class='mr-1' :icon='item.icon' />
				{{ item.text }}
			</v-btn>
		</v-toolbar-items>
		<v-toolbar-items class='' v-if='authed &&!mobile'>
			<v-row align='center'>
				<v-col cols='auto mr-6' class='cl' @click='goToSettings'>
					{{ userEmail }}
				</v-col>
			</v-row>
		</v-toolbar-items>
		<v-toolbar-items v-if='mobile ' class='mr-xs-4 '>
			<v-row class='no-gutters' justify='center' align='center'>
				<v-col cols='auto' class='mr-2'>
					<v-icon class='' large @click='drawer=!drawer' :icon='mdiMenu' />
				</v-col>
			</v-row>
		</v-toolbar-items>

		<template v-slot:extension v-if='!online'>
			<v-row
				v-if='!online'
				:class='alert_class'
				class='ma-0 pa-0'
				justify='end'
				dense
				no-gutters
			>
				<v-col cols='12' class='ma-0 pa-0'>
					<OfflineRow  />
				</v-col>
			</v-row>
		</template>
					
		<v-progress-linear
			:active='loading'
			:indeterminate='loading'
			color='primary'
			width='100%'
			absolute
			location='bottom'
		/>
	</v-app-bar>
</template>

<script setup lang='ts'>

import type { su } from '@/types';
import { FrontEndRoutes } from '@/types/enum_routes';
import { mdiAccountPlus, mdiLogin, mdiMenu } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { mdAndDown, smAndDown } = useDisplay();

const alert_class = computed((): string => {
	return smAndDown.value? 'alert-bottom' : 'alert-top';
});

const mobile = computed(() : boolean => {
	return mdAndDown.value;
});

const drawer = computed({
	get (): boolean {
		return drawerModule().open;
	},
	set (b: boolean): void {
		drawerModule().set_open(b);
	}
});

let router = useRouter();
let route = useRoute();

const online = computed((): boolean => {
	return browserModule().online;
});
const authed = computed((): boolean => {
	return userModule().authenticated;
});
const loading = computed((): boolean => {
	return loadingModule().loading;
});
const navTitleFontSize = computed((): string => {
	return mobile.value ? 'text-h5' : 'text-h4';
});
const toolbarHeight = computed((): number =>{
	return mobile.value ? 56 : 80;
});
const userEmail = computed((): su => {
	return userModule().email;
});

const registerLinks = [
	{ icon: mdiAccountPlus, text: 'register', route: '/register' },
	{ icon: mdiLogin, text: 'sign-in', route: '/signin' },
];

/**
 ** Clicking logo, navigation to home page depending on if authed or what page currently on
 */

const goHome = (): void => {
	if (authed.value && route.name !== FrontEndRoutes.MEALS) router.push(FrontEndRoutes.MEALS);
	if (!authed.value && route.name !== FrontEndRoutes.BASE) router.push(FrontEndRoutes.BASE);
};

const goToSettings = (): void => {
	router.push(FrontEndRoutes.SETTINGS);

};
</script>