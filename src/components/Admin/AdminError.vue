<template>
	<v-row justify='center' class='no-gutters'>
		<v-col cols='12' class=''>
			<v-row justify='center' class='no-gutters'>
				<v-col cols='12' >
					<v-data-table
						:headers='headers'
						:items='errorLog'
						:sort-desc='true'
						class='elevation-1 mt-4'
						density='compact'
						id='datatable'
					>

						<template v-slot:[`item.timestamp`]='{ item }'>
							<div class=''>{{ item.timestamp }}</div>
						</template>

						<template v-slot:[`item.level`]='{ item }'>
							<div :class='item.level === "ERROR" ? "text-mealtype" : ""'>{{ item.level }}</div>
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

<script setup lang='ts'>
import type { TLogs } from '@/types';

const errorLog = computed((): Array<TLogs> => {
	return adminModule().logs;
});

const headers = [
	{
		title: 'timestamp',
		align: 'start',
		sortable: true,
		value: 'timestamp'
	},
	{
		title: 'level',
		align: 'start',
		sortable: true,
		value: 'level'
	},
	{
		title: 'message',
		align: 'start',
		sortable: true,
		value: 'fields'
	}
] as const;

</script>