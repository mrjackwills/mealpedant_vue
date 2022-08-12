<template>
	<v-row justify='center' class='no-gutters'>
		<v-col cols='12' class=''>
			<v-row justify='center' class='no-gutters'>
				<v-col cols='12' >
					<!-- <v-data-table
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
					</v-data-table> -->

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

						<template v-slot:[`item.timestamp`]='{ item }'>
							<div class=''>{{ item.timestamp }}</div>
						</template>

						<template v-slot:[`item.level`]='{ item }'>
							<div :class='item.level === "ERROR" ? "mealtype--text" : ""'>{{ item.level }}</div>
						</template>
						<template v-slot:[`item.fields`]='{ item }'>
							<div v-for='(i, ii) in item.fields' :key='ii' class=''>
								{{ i }}
							</div>
						</template>

					</v-data-table>
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
				text: 'timestamp',
				align: 'left',
				sortable: true,
				value: 'timestamp'
			},
			{
				text: 'level',
				align: 'left',
				sortable: true,
				value: 'level'
			},
			{
				text: 'fields',
				align: 'left',
				sortable: true,
				value: 'fields'
			},
		],
	}),

	methods: {
		formatTime (i: string): string {
			return `${i.substring(0, 10)} ${new Date(i).toString().substring(16, 24)}`;
		},
		// removeVerbose (): void {
		// 	const newData = [];
		// 	for (const e of this.errorLog) if (e.level !== 'verbose') newData.push(e);
		// 	// this.adminStore.set_error(newData);
		// 	// this.errorOriginal = false;
		// },
	},
});
</script>