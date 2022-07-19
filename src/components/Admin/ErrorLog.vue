<template>
	<v-row justify='center' class='no-gutters'>
		<v-col cols='12' class=''>
			<v-row justify='center' class='no-gutters'>
				<v-col cols='12' >
					<v-data-table
						:headers='headers'
						:items='errorLog'
						:mobile-breakpoint='0'
						sort-by='timestamp'
						:sort-desc='true'
						class='elevation-1 mt-4'
						id='datatable'
						ref='errorlogDatatable'
						must-sort
						single-expand
					>
						<template v-slot:[`item.logs`]='{ item }'>
							<div class=''>{{ item.logs }}</div>
						</template>
					</v-data-table>
				</v-col>
			</v-row>
			<v-row justify='center' class='no-gutters'>
				<v-col cols='auto' class='mt-2'>
					<v-btn
						@click='removeVerbose'
						:disabled='!errorOriginal'
					>
						remove verbose
					</v-btn>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { adminModule, loadingModule } from '@/store';
import { mapStores } from 'pinia';
import { TLogs } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'admin-error-log-component',

	computed: {
		...mapStores(adminModule),

		errorLog (): Array<TLogs> {
			return this.adminStore.logs;
		},
		errorOriginal: {
			get: function (): boolean {
				return this.adminStore.errorOriginal;
			},
			set: function (b: boolean): void {
				this.adminStore.set_errorOriginal(b);
			}
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
	},

	data: () => ({
		headers: [
			{
				text: 'logs',
				align: 'left',
				sortable: false,
				value: 'logs'
			},
		],
	}),

	methods: {
		formatTime (i: string): string {
			return `${i.substring(0, 10)} ${new Date(i).toString().substring(16, 24)}`;
		},
		removeVerbose (): void {
			const newData = [];
			for (const e of this.errorLog) if (e.level !== 'verbose') newData.push(e);
			this.adminStore.set_error(newData);
			this.errorOriginal = false;
		},
	},
});
</script>