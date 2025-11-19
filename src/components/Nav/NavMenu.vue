<template>
	<v-navigation-drawer
		id='nav_menu'
		v-model='drawer'
		app
		color='navmenu'
		height=''
		:location='mobile ? "right" : "left"'
		:mobile-breakpoint='960'
		:rail='mini'
		touchless
		width='150'
	>
		<v-list v-if='init'>
			<section v-if='mobile'>

				<v-list-item class='cl' density='compact' @click='(drawer = !drawer)'>
					<template #prepend>
						<v-icon class='flipx' :icon='mdiClose' size='small' />
					</template>
					<template #title>
						<span class='ml-2 text-body-2'>close</span>
					</template>
				</v-list-item>
				<v-divider class='' />
			</section>
			<section v-if='!authed && mobile'>
				<v-list-item
					v-for='(item, index) in registerLinks'
					:key='`drt${index}`'
					density='compact'
					router
					:to='item.route'
				>
					<template #prepend>
						<v-icon class='ma-0 pa-0' :icon='item.icon' size='small' />
					</template>
					<template #title>
						<span class='text-body-2'>{{ item.text }}</span>
					</template>
				</v-list-item>
			</section>
			<section v-if='authed'>

				<v-list-item
					v-for='(item, index) in drawerLinks'
					:key='`dr${index}`'
					density='compact'
					router
					:to='item.route'
				>
					<template #prepend>
						<v-icon class='ma-0 pa-0' :icon='item.icon' size='small' />
						<v-tooltip
							v-if='mini &&!mobile'
							activator='parent'
							location='end'
							:text='item.text'
						/>
					</template>
					<template #title>
						<span class='text-body-2'>{{ item.text }}</span>
					</template>
				</v-list-item>

				<section v-if='admin'>

					<v-list-item
						v-for='(item, index) in adminLinks'
						:key='`al${index}`'
						density='compact'
						router
						:to='item.route'
					>
						<template #prepend>
							<v-icon class='ma-0 pa-0' :icon='item.icon' size='small' />
							<v-tooltip
								v-if='mini &&!mobile'
								activator='parent'
								location='end'
								:text='item.text'
							/>
						</template>
						<template #title>
							<span class='text-body-2'>{{ item.text }}</span>
						</template>
					</v-list-item>

					<v-list-item class='cl' density='compact' @click='flushCache'>
						<template #prepend>
							<v-icon class='ma-0 pa-0' :icon='mdiDeleteSweep' size='small' />
							<v-tooltip
								v-if='mini &&!mobile'
								activator='parent'
								location='end'
								text='flush cache'
							/>
						</template>
						<template #title>
							<span class='text-body-2'>flush cache</span>
						</template>
					</v-list-item>
				</section>

				<v-list-item v-if='!mobile' class='cl ' density='compact' @click='mini = !mini'>
					<template #prepend>
						<v-icon class='ma-0 pa-0' :icon='minivariantIcon' size='small' />
						<v-tooltip
							v-if='mini &&!mobile'
							activator='parent'
							location='end'
							text='maxmize'
						/>
					</template>
					<template #title>
						<span class='text-body-2'>minimize</span>
					</template>
				</v-list-item>

				<v-divider class='my-2' />

				<v-list-item class='cl' density='compact' @click='signout'>
					<template #prepend>
						<v-icon class='ma-0 pa-0' :icon='mdiPower' size='small' />
						<v-tooltip
							v-if='mini &&!mobile'
							activator='parent'
							location='end'
							text='sign out'
						/>
					</template>
					<template #title>
						<span class='text-body-2'>sign out</span>
					</template>
				</v-list-item>

			</section>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup lang='ts'>
import type { PV } from '@/types'
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
	mdiPower,
} from '@mdi/js'
import { useDisplay } from 'vuetify'
import { axios_admin } from '@/services/axios'
import { FrontEndRoutes } from '@/types/const_routes'
const { smAndDown } = useDisplay()

const [drawStore, userStore] = [drawerModule(), userModule()]

const mobile = computed(() => smAndDown.value)
const admin = computed(() => userStore.admin)
const authed = computed(() => userStore.authenticated)

const minivariantIcon = computed(() => mini.value ? mdiChevronRight : mdiChevronLeft)

const init = ref(false)
const drawer = computed({
	get (): boolean {
		return drawStore.open
	},
	set (b: boolean): void {
		drawStore.set_open(b)
	},
})

const mini = computed({
	get (): boolean {
		return drawStore.mini
	},
	set (b: boolean): void {
		drawStore.set_mini(b)
	},
})

async function flushCache (): PV {
	await axios_admin.cache_delete()
	if (mobile.value && drawer.value) drawer.value = false
}
onBeforeMount(() => {
	if (!mobile.value && authed.value) {
		drawer.value = true
		mini.value = false
	}
	init.value = true
})

const drawerLinks = [
	{
		icon: mdiFood,
		text: 'meals',
		route: FrontEndRoutes.MEALS,
	},
	{
		icon: mdiAccountCircle,
		text: 'settings',
		route: FrontEndRoutes.SETTINGS,
	},
]
const adminLinks = [
	{
		icon: mdiPlusCircle,
		text: 'add meal',
		route: FrontEndRoutes.ADDMEAL,
	},
	{
		icon: mdiCog,
		text: 'admin',
		route: FrontEndRoutes.ADMIN,
	},
]
const registerLinks = [
	{
		icon: mdiFood,
		text: 'meals',
		route: FrontEndRoutes.MEALS,
	},
	{
		icon: mdiAccountPlus,
		text: 'register',
		route: FrontEndRoutes.REGISTER,
	},
	{
		icon: mdiLogin,
		text: 'sign-in',
		route: FrontEndRoutes.SIGNIN,
	},
]

// Sign out via the pinia method
function signout (): void {
	mini.value = false
	userModule().clientSideSignout()
}

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
