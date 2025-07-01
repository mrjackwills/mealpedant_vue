<template>
	<v-footer class='ma-0 pa-0' color='transparent' id='footer' absolute app :order='3' name='footer'>
		<v-row justify='center' align='center' class='no-gutters ma-0 pa-0'>

			<v-col cols='auto' class='no-gutters unselectable ma-0 pa-0 my-2'>

				<v-chip :ripple='false' color='offwhite' class='smalltext' text-color='black' variant='flat' density='compact'>
					<section v-if='showBuild' class='' @click='buildInfo'>
						<span class='smalltext'>site: {{ env.app_version }}</span>
						<span class='smalltext ml-1'>built: {{ env.build_date }}</span>
						<span class='smalltext ml-1'>api: {{ apiVersion }}</span>
					</section>

					<section v-else>
						<a href='https:/www.github.com/mrjackwills' target='_blank' rel='noopener noreferrer' class='text-caption'>
							<v-icon color='black' class='mr-2' href='' :icon='mdiGithub' />
						</a>
						<span @click='buildInfo' class=''>
							mrjackwills 2015 -
						</span>
					</section>

				</v-chip>
			</v-col>
		</v-row>

	</v-footer>
</template>

<script setup lang='ts'>

import { mdiGithub } from '@mdi/js';
import { env } from '@/vanillaTS/env';

onBeforeMount(() => {
	clearTimeout(buildTimeout.value);
});

const apiVersion = computed(() => `${browserModule().api_version}`);

const buildTimeout = ref(0);
const showBuild = ref(false);

// Show build date on version number click if authed
const buildInfo = (): void => {
	showBuild.value = !showBuild.value;
	clearTimeout(buildTimeout.value);
	buildTimeout.value = window.setTimeout(() => {
		showBuild.value = false;
	}, 10000);
};
</script>

<style scoped>

a {
	color: #000000 !important;
}
</style>
