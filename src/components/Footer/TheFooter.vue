<template>
	<v-footer
		class='ma-0 pa-0'
		color='transparent'
		id='footer'
		absolute
		app
		:order='3'
	>
		<v-row justify='center' align='center' class='no-gutters ma-0 pa-0' >

			<v-col cols='auto' class='no-gutters unselectable ma-0 pa-0 my-2'>

				<v-chip
					:ripple='false'
					color='offwhite'
					text-color='black'
					variant='flat'
					outlined
					pill
				>
					<section v-if='showBuild' class='' @click='buildInfo'>
						<span>site version: {{ env.app_version }}</span>
						<span class='ml-3 '>built: {{ env.build_date }}</span>
						<span class='ml-3 '>api_version: {{ apiVersion }}</span>
					</section>

					<section v-else>
						<a :href='githubHref' target='_blank' rel='noopener noreferrer' class='text-caption'>
							<v-icon color='black' class='mr-2' href='' :icon='mdiGithub' />
						</a>
						<span @click='buildInfo' class=''>
							mrjackwills 2021 -
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
import { githubHref } from '@/vanillaTS/globalConst';

onBeforeMount(() => {
	clearTimeout(buildTimeout.value);
});
		
const apiVersion = computed((): string => {
	return `${browserModule().api_version}`;
});

const buildTimeout = ref(0);
const showBuild = ref(false);

/**
** Show build date on version number click if authed
*/
const buildInfo = (): void => {
	showBuild.value = !showBuild.value;
	clearTimeout(buildTimeout.value);
	buildTimeout.value = window.setTimeout(() => {
		showBuild.value = false;
	}, 10000);
};
</script>

<style scoped>
.lowercase-button{
	text-transform: lowercase;
}

a {
	color: #000000!important;
}
</style>