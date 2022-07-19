<template>
	<v-container container--fluid fill-height class='ma-0'>
		<v-row
			align='center'
			justify='center'
		>
			<v-col
				cols='12'
				align='center'
				justify='center'
			>
				<p class='text-center '>
					Since May 9th 2015, two transatlantic friends have pedantically exchanged information on every evening meal that they have consumed.
					This is a comprehensive chronicling of that pedantry.
				</p>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { env } from '@/vanillaTS/env';
import { MetaInfo } from 'vue-meta';
import Vue from 'vue';
export default Vue.extend({
	name: 'home-page',

	data: () => ({
		pageTitle: 'Home',
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			meta: [
				{
					name: 'description',
					content: `Meal Pedant - A comprehensive chronicling.` }
			],
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},
	
});
</script>