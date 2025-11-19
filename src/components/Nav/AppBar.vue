<template>
	<v-app-bar
		app
		clipped-left
		:extended='!online'
		extension-height='40'
		flat
		:height='`${toolbarHeight}`'
		name='header'
	>
		<router-link :to='FrontEndRoutes.MEALS'>
			<v-avatar class='cl mx-2' :size='`${toolbarHeight - 8}px`' tile>
				<v-img id='topOfPage' :eager='true' src='@/assets/tile_svg.svg' />
			</v-avatar>
		</router-link>
		<v-toolbar-title>
			<router-link class='text-white' :to='FrontEndRoutes.MEALS'>
				<span class='font-weight-bold' :class='navTitleFontSize' FrontendRoutes.BASE>Meal Pedant</span>
				<section v-if='!mobile' class='mx-1'>
					<span class='font-weight-light font-italic tag-line text-subtitle-1'>"A meticulous daily log of
						ingestion"</span>
				</section>
			</router-link>
		</v-toolbar-title>
		<v-toolbar-items v-if='!authed && !mobile' class=''>
			<v-btn v-for='(item, index) in registerLinks' :key='`${index}`' class='cl' :to='item.route'>
				<v-icon class='mr-1' dark :icon='item.icon' small />
				{{ item.text }}
			</v-btn>
		</v-toolbar-items>
		<v-toolbar-items v-if='authed && !mobile' class=''>
			<v-row align='center'>
				<v-col class='cl' cols='auto mr-6'>
					<router-link :to='FrontEndRoutes.SETTINGS'>
						<v-chip class='text-white'>
							{{ userEmail }}
						</v-chip>
					</router-link>
				</v-col>
			</v-row>
		</v-toolbar-items>
		<v-toolbar-items v-if='mobile' class='mr-xs-4'>
			<v-row align='center' class='no-gutters' justify='center'>
				<v-col class='mr-2' cols='auto'>
					<v-icon class='' :icon='mdiMenu' large @click='drawer = !drawer' />
				</v-col>
			</v-row>
		</v-toolbar-items>

		<template v-if='!online' #extension>
			<v-row
				class='ma-0 pa-0'
				:class='alert_class'
				denisty='compact'
				justify='end'
				no-gutters
			>
				<v-col class='ma-0 pa-0' cols='12'>
					<OfflineRow />
				</v-col>
			</v-row>
		</template>

		<v-progress-linear
			absolute
			:active='loading'
			color='primary'
			:indeterminate='loading'
			location='bottom'
			width='100%'
		/>
	</v-app-bar>
</template>

<script setup lang='ts'>
import { mdiAccountPlus, mdiFood, mdiLogin, mdiMenu } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { FrontEndNames, FrontEndRoutes } from '@/types/const_routes'

const { smAndDown } = useDisplay()

const alert_class = computed((): string => {
	return smAndDown.value ? 'alert-bottom' : 'alert-top'
})

const mobile = computed((): boolean => {
	return smAndDown.value
})

const drawer = computed({
	get (): boolean {
		return drawerModule().open
	},
	set (b: boolean): void {
		drawerModule().set_open(b)
	},
})

const online = computed(() => browserModule().online)
const authed = computed(() => userModule().authenticated)
const loading = computed(() => loadingModule().loading)
const navTitleFontSize = computed(() => mobile.value ? 'text-h5' : 'text-h4')
const toolbarHeight = computed(() => mobile.value ? 56 : 80)
const userEmail = computed(() => userModule().email)

const registerLinks = [
	{
		icon: mdiFood,
		text: FrontEndNames.MEALS,
		route: FrontEndRoutes.MEALS,
	},
	{
		icon: mdiAccountPlus,
		text: FrontEndNames.REGISTER,
		route: FrontEndRoutes.REGISTER,
	},
	{
		icon: mdiLogin,
		text: FrontEndNames.SIGNIN,
		route: FrontEndRoutes.SIGNIN,
	},
]

</script>

<style>
.monochrome {
	-webkit-filter: grayscale(100%);
	filter: grayscale(100%);
}
</style>
