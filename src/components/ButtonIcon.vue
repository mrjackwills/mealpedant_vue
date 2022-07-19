<template>
	<v-icon
		:class='margin'
		:color='color'
		:small='$vuetify.breakpoint.mdAndDown || small'
		:x-small='xsmall'
		style='vertical-align: middle;'
	>
		{{ icon }}
	</v-icon>
</template>

<script lang='ts'>
import Vue from 'vue';
import { mdiCheck } from '@mdi/js';

export default Vue.extend({
	name: 'button-icon-component',
	
	props: {
		icon: {
			type: String,
			default: mdiCheck
		},
		color: {
			type: String,
			default: 'white',
		},
		small: {
			type: Boolean,
			default: false,
		},
		margin: {
			type: String,
			default: 'mr-2'
		},
		xsmall: {
			type: Boolean,
			default: false,
		},
	}
});
</script>