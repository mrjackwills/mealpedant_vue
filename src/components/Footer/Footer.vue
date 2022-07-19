<template>
	<v-footer
		absolute
		color='transparent'
	>
		<v-row justify='center' align='center' class='py-0 ma-0 no-gutters'>
			<v-col cols='auto' class='py-0 mr-8 ma-0 no-gutters'>
				<transition name='snack-fade' >
					<app-footer-text v-if='!visible' />
				</transition>
			</v-col>
		</v-row>
	</v-footer>
</template>

<script lang='ts'>
import { snackbarModule } from '@/store';
import FooterText from '@/components/Footer/FooterText.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'footer-component',

	components: {
		appFooterText: FooterText,
	},

	computed: {
		visible (): boolean {
			return snackbarModule().visible;
		},
	},
});
</script>