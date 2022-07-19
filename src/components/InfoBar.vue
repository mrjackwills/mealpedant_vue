<template>
	<v-row align='center' justify='center' class='pa-0 ma-0'>
		<v-col cols='12' sm='7' md='4' lg='3' class='pa-0 ma-1'>
			<v-alert
				class='pa-0 ma-0 py-2'
				:color='color'
			>
				<v-row justify='space-around' align='center' class='ma-0 pa-0'>
					<v-col cols='auto' class='pa-0 ma-0'>
						<v-icon small color='white'>{{ mdiInformation }}</v-icon>
					</v-col>
					<v-col cols='auto' class='white--text pa-0 ma-0 px-2' >
						<div class='text-overline'>{{ message }}</div>
					</v-col>
					<v-col cols='auto' class='pa-0 ma-0'>
						<v-icon
							@click='infoClose'
							color='white'
							small
						>
							{{ mdiClose }}
						</v-icon>
					</v-col>
				</v-row>
			</v-alert>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { infobarModule } from '@/store';
import { mdiClose, mdiInformation } from '@mdi/js';
import Vue from 'vue';

export default Vue.extend({
	name: 'infobar-component',

	data: () => ({
		mdiClose,
		mdiInformation
	}),

	methods: {
		infoClose (): void {
			infobarModule().remove_message(this.message);
		}
	},

	props: {
		message: {
			type: String,
			required: true
		},
		color: {
			type: String,
			default: 'secondary'
		}
	},
});
</script>