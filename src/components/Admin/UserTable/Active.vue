<template>
	<v-row justify='start' align='center' class='ma-0 pa-0'>
		<v-col cols='auto' class='ma-0 pa-0'>
			<v-switch
				v-model='newActive'
				:disabled='disabled || readOnly'
				:readonly='readOnly'
			/>
		</v-col>
		<v-expand-x-transition>
			<v-col cols='auto' class='ma-0 pa-0 heartbeat' v-if='showSave'>
				<v-btn
					@click='save'
					class='ma-0 pa-0'
					fab
					small
					text
				>
					<v-icon small color='secondary'>{{ mdiContentSave }}</v-icon>
				</v-btn>
			</v-col>
		</v-expand-x-transition>
	</v-row>
</template>

<script lang='ts'>
import Vue from 'vue';
import { axios_admin } from '@/services/axios';
import { mdiContentSave } from '@mdi/js';

export default Vue.extend({
	name: 'user-table-active-column',
	computed: {
		disabled (): boolean {
			return this.removeOnly && !this.active ? true: false;
		},
		showSave (): boolean {
			return this.removeOnly ? !this.newActive && this.newActive !== this.active : this.newActive !== this.active;
		}

	},
	data: () => ({
		newActive: false,
		mdiContentSave
	}),
	methods: {
		async save (): Promise<void> {
			await axios_admin.user_patch({ patch: { [this.patchName]: this.newActive }, email: this.email });
			await axios_admin.user_get();
		}
	},
	beforeMount () {
		this.newActive = this.active;
	},
	props: {
		active: {
			type: Boolean,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		removeOnly: {
			type: Boolean,
			default: false,
		},
		patchName: {
			type: String,
			required: true
		},
		readOnly: {
			type: Boolean,
			default: false,
		}
	}
});

</script>