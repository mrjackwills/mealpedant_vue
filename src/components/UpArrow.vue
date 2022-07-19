<template>
	<transition
		name='fade'
		mode='out-in'
	>
		<v-btn
			v-if='scrolled'
			@click='go'
			:small='$vuetify.breakpoint.mdAndDown'
			class='mr-1'
			color='error'
			style='bottom:1rem;'
			absolute
			dark
			fab
			fixed
			right
		>
			<v-icon :small='$vuetify.breakpoint.mdAndDown'>{{ mdiArrowUp }}</v-icon>
		</v-btn>
	</transition>
</template>

<script lang='ts'>
import { mdiArrowUp } from '@mdi/js';
import Vue from 'vue';

export default Vue.extend({
	name: 'up-arrow-component',

	created () {
		window.addEventListener('scroll', this.scrollEvent);
	},

	data: () => ({
		scrolled: false,
		mdiArrowUp
	}),

	destroyed () {
		window.removeEventListener('scroll', this.scrollEvent);
	},

	methods: {
		scrollEvent (): void {
			this.scrolled = window.scrollY > 200 ? true : false;
		},
		go (): void {
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
		}
	},
	
});
</script>