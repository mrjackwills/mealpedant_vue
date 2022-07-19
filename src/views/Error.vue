<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' >
			<v-col cols='12' @click='goHome' class='cl text-center'>
				<div
					v-for='(item,index) in rows'
					:class='item.class'
					:key='index'
				>
					{{ item.text }}
				</div>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { env } from '@/vanillaTS/env';
import { MetaInfo } from 'vue-meta';
import Vue from 'vue';
export default Vue.extend({
	name: 'error-page',

	data: () => ({
		pageTitle: 'Error',
		rows: [
			{
				class: 'text-h5',
				text: 'page not found'
			},
			{
				class: 'text-h1 pulse',
				text: 'Error'
			},
			{
				class: 'text-h5',
				text: 'return to home page'
			}

		],
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			meta: [
				{ name: 'description', content: `Meal Pedant - The page that you are looking for cannot be found, are you sure the address is correct.` }
			],
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	methods: {
		goHome (): void {
			this.$router.push('/');
		}
	},
});
</script>
