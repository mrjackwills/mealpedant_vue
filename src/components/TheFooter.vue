<template>
	<v-footer
		id='footer'
		absolute
		app
		class='ma-0 pa-0 order-3'
		color='transparent'
		name='footer'
	>
		<v-row class='ma-0 pa-0 justify-center' density='compact'>

			<v-col class='unselectable ma-0 pa-0 my-2' cols='auto' density='compact'>

				<v-chip
					class=''
					color='offwhite'
					density='compact'
					:ripple='false'
					text-color='black'
					variant='flat'
				>
					<section v-if='showBuild' class='' @click='buildInfo'>
						<span class=''>site: {{ env.app_version }}</span>
						<span class=' ml-1'>built: {{ env.build_date }}</span>
						<span class=' ml-1'>api: {{ apiVersion }}</span>
					</section>

					<section v-else>
						<!-- <a :href target='_blank' rel='noopener noreferrer' class='text-body-small'> -->
						<a class='text-body-small text-black' href='https://www.github.com/mrjackwills' rel='noopener noreferrer' target='_blank'>
							<v-icon class='mr-2' color='black' href='' :icon='mdiGithub' />
						</a>

						<span class='' @click='buildInfo'>
							mrjackwills 2015 -
						</span>
					</section>

				</v-chip>
			</v-col>
		</v-row>

	</v-footer>
</template>

<script setup lang='ts'>

import { mdiGithub } from '@mdi/js'
import { env } from '@/vanillaTS/env'

onBeforeMount(() => {
	clearTimeout(buildTimeout.value)
})

const apiVersion = computed(() => `${browserModule().api_version}`)

const buildTimeout = ref(0)
const showBuild = ref(false)

// Show build date on version number click if authed
function buildInfo (): void {
	showBuild.value = !showBuild.value
	clearTimeout(buildTimeout.value)
	buildTimeout.value = window.setTimeout(() => {
		showBuild.value = false
	}, 10_000)
}
</script>

<style scoped>

a {
	color: #000000 !important;
}
</style>
