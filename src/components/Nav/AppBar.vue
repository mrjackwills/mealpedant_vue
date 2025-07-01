<template>
	<v-app-bar :extended='!online' :height='`${toolbarHeight}`' color='appbar' extension-height='40' app clipped-left name='header'
		flat>
		<router-link :to='FrontEndRoutes.MEALS'>
			<v-avatar :size='`${toolbarHeight - 8}px`' tile class='cl mx-2'>
				<v-img src='@/assets/tile_svg.svg' :eager='true' id='topOfPage' />
			</v-avatar>
		</router-link>
		<v-toolbar-title>
			<router-link :to='FrontEndRoutes.MEALS' class='text-white'>
				<span class='font-weight-bold' :class='navTitleFontSize' FrontendRoutes.BASE>Meal Pedant</span>
				<section v-if='!mobile' class='mx-1'>
					<span class='font-weight-light font-italic tag-line text-subtitle-1'>"A meticulous daily log of
						ingestion"</span>
				</section>
			</router-link>
		</v-toolbar-title>
		<v-toolbar-items class='' v-if='!authed && !mobile'>
			<v-btn v-for='(item, index) in registerLinks' :key='`${index}`' :to='item.route' class='cl'>
				<v-icon dark small class='mr-1' :icon='item.icon' />
				{{ item.text }}
			</v-btn>
		</v-toolbar-items>
		<v-toolbar-items class='' v-if='authed && !mobile'>
			<v-row align='center'>
				<v-col cols='auto mr-6' class='cl' >
					<router-link :to='FrontEndRoutes.SETTINGS'>
						<v-chip class='text-white'>
							{{ userEmail }}
						</v-chip>
					</router-link>
				</v-col>
			</v-row>
		</v-toolbar-items>
		<v-toolbar-items v-if='mobile' class='mr-xs-4'>
			<v-row class='no-gutters' justify='center' align='center'>
				<v-col cols='auto' class='mr-2'>
					<v-icon class='' large @click='drawer = !drawer' :icon='mdiMenu' />
				</v-col>
			</v-row>
		</v-toolbar-items>

		<template v-slot:extension v-if='!online'>
			<v-row :class='alert_class' class='ma-0 pa-0' justify='end' denisty='compact' no-gutters>
				<v-col cols='12' class='ma-0 pa-0'>
					<OfflineRow />
				</v-col>
			</v-row>
		</template>

		<v-progress-linear :active='loading' :indeterminate='loading' color='primary' width='100%' absolute
			location='bottom' />
	</v-app-bar>
</template>

<script setup lang='ts'>
import { FrontEndNames } from '@/types/const_routes';
import { FrontEndRoutes } from '@/types/const_routes';
import { mdiAccountPlus, mdiFood, mdiLogin, mdiMenu } from '@mdi/js';
import { useDisplay } from 'vuetify';

const { smAndDown } = useDisplay();

const alert_class = computed((): string => {
	return smAndDown.value ? 'alert-bottom' : 'alert-top';
});

const mobile = computed((): boolean => {
	return smAndDown.value;
});

const drawer = computed({
	get (): boolean {
		return drawerModule().open;
	},
	set (b: boolean): void {
		drawerModule().set_open(b);
	}
});

const online = computed(() => browserModule().online);
const authed = computed(() => userModule().authenticated);
const loading = computed(() => loadingModule().loading);
const navTitleFontSize = computed(() => mobile.value ? 'text-h5' : 'text-h4');
const toolbarHeight = computed(() => mobile.value ? 56 : 80);
const userEmail = computed(() => userModule().email);

const registerLinks = [
	{
		icon: mdiFood,
		text: FrontEndNames.MEALS,
		route: FrontEndRoutes.MEALS
	},
	{
		icon: mdiAccountPlus,
		text: FrontEndNames.REGISTER,
		route: FrontEndRoutes.REGISTER
	},
	{
		icon: mdiLogin,
		text: FrontEndNames.SIGNIN,
		route: FrontEndRoutes.SIGNIN
	}
];

</script>

<style>
.monochrome {
	-webkit-filter: grayscale(100%);
	filter: grayscale(100%);
}
</style>
