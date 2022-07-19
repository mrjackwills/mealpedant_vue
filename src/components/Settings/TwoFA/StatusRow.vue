<template>
	<section class='mb-1'>
		<v-row class='ma-0 pa-0' align='center' justify='center'>
			<v-col cols='12' sm='10' md='8' class='ma-0 pa-0'>
				<v-row class='ma-0 pa-0' align='center'>
					<v-col
						:class='{"mr-2": $vuetify.breakpoint.mdAndUp}'
						class='ma-0 pa-0'
						cols='1'
						sm='auto'
					>
						<v-icon
							:color='iconColor'
							:small='$vuetify.breakpoint.smAndDown'
						>{{ icon }}</v-icon>
					</v-col>
					<v-col cols='10' sm='auto' class='ma-0 pa-0'>
						<span class='text-h6' :class='textColor'>{{ text }}</span>
					</v-col>
					<v-spacer />
					<v-col cols='1' sm='auto' class='ma-0 pa-0 pi--text' v-if='active'>
						<v-row justify='end' class='pa-0 ma-0'>
							<v-col cols='auto' class='pa-0 ma-0'>
								<v-btn
									@click='click'
									icon
									x-small
								>
									<v-icon color='white'>{{ mdiCloseCircle }}</v-icon>
								</v-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</section>
</template>

<script lang='ts'>
import { mdiAlertCircle, mdiCheckCircle, mdiCloseCircle } from '@mdi/js';
import Vue from 'vue';

export default Vue.extend({
	name: 'active-row-component',

	computed: {
		icon (): string {
			return this.active ? mdiCheckCircle: mdiAlertCircle;
		},
		iconColor (): string {
			return this.active ? 'white' : 'error';
		},
		textColor (): string {
			return this.active ? 'white--text' : 'error--text';
		},
	},

	data: () => ({
		mdiCloseCircle,
	}),

	methods: {
		click (): void {
			this.$emit('click');
		}
	},

	props: {
		active: {
			type: Boolean,
			required: true
		},
		text: {
			type: String,
			required: true
		},
	}
});
</script>