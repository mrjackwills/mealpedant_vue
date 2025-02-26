<template>
	<v-row justify='center' align='center' no-gutters class='ma-0 pa-0' >
		<v-expand-transition>
			<v-col v-if='showBuild && authed' cols='12' :order='3' class='text-caption text-center' >

				<div
					class='mt-1'
				>
					{{ buildDate }}
				</div>
				<v-tooltip activator='parent' location='top center' content-class='tooltip'>
					<span>site build date</span>
				</v-tooltip>

				<div
					class='mt-1'
				>
					{{ api_version }}
				</div>
				<v-tooltip activator='parent' location='top center' content-class='tooltip'>
					<span>api version</span>
				</v-tooltip>

			</v-col>
		</v-expand-transition>
		<v-col cols='12' :md='authed? "12":"auto"' :order='appOrder' class='text-caption text-center' :class='authedMargin' @click='buildInfo'>

			<div
				class='mt-1'
			>
				{{ appVersion }}
			</div>
			<v-tooltip activator='parent' location='top center' content-class='tooltip'>
				<span>site version</span>
			</v-tooltip>
				
		</v-col>
		<v-col cols='12' md='auto' order='2' order-md='1' class='text-caption text-center' :class='authedMargin' @click='buildInfo'>
			<v-row class='no-gutters' align='center' justify='center'>
				<v-col class='' cols='auto' :order='copyrightOrder' :class='copyrightMargin'>
					<v-icon style='vertical-align: middle;' white size='x-small' :icon='mdiCopyright' />
				</v-col>
				<v-col class='' :order='yearOrder' cols='auto' >
					Meal Pedant {{ year }}
				</v-col>
			</v-row>
		</v-col>
		<v-col cols='12' order='2' order-md='1' class='text-caption text-center' :class='authedMargin' >
			<a :href='source_code' target='_blank' rel='noopener noreferrer' class='text-caption white--text'>
				<v-row class='no-gutters' align='center' justify='center'>
					<v-col class='' cols='auto' :class='copyrightMargin'>
						<v-icon style='vertical-align: middle;' white size='x-small' :icon='mdiGithub' />
					</v-col>
					<v-col class='' cols='auto' >
						source code
					</v-col>
				</v-row>
			</a>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { env } from '@/vanillaTS/env';
import { mdiCopyright, mdiGithub } from '@mdi/js';
import type { su } from '@/types';
import { githubHref } from '@/vanillaTS/globalConst';
import { useDisplay } from 'vuetify';
const { mdAndUp, smAndDown } = useDisplay();

onBeforeUnmount(() => {
	clearTimeout(buildTimeout.value);

});

const source_code = `${githubHref}/mealpedant_vue`;
	
const api_version = computed((): su => {
	return browserModule().api_version;
});
const appOrder = computed((): string => {
	return authed.value || mdAndUp.value ? '1' : '2';
});
const appVersion = computed((): string => {
	return env.app_version;
});
const authed = computed((): boolean => {
	return userModule().authenticated;
});
const authedMargin = computed((): string => {
	return authed.value ? 'py-0' : 'pa-1';
});
const buildDate = computed((): string => {
	return env.build_date;
});
const copyrightOrder = computed((): string => {
	return mdAndUp.value && !authed.value ? '2' : '1';
});
const copyrightMargin = computed((): string => {
	return smAndDown.value ? 'mr-1' : 'mx-1';
});

const year = computed((): number => {
	return new Date().getUTCFullYear();
});
const yearOrder = computed((): string => {
	return mdAndUp.value ? '1' : '2';
});

const showBuild = ref(false);
const buildTimeout = ref(0);

const buildInfo = (): void => {
	if (!authed.value) return;
	clearTimeout(buildTimeout.value);
	showBuild.value = !showBuild.value;
	buildTimeout.value = window.setTimeout(() => {
		showBuild.value = false;
	}, 20000);
};
	
</script>

<style>
.v-tooltip__content {
	font-size: 11px !important;
	padding: 2px 6px 2px 6px!important;
}
</style>