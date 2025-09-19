<template>
	<v-row justify='center' class='no-gutters'>
		<v-col cols='12' md='10' class=''>
			<v-row justify='center' class='no-gutters'>
				<v-col cols='12'>
					<v-data-table-virtual
						:headers
						:items='errorLog'
						:mobile='smAndDown'
						class='elevation-1 mt-4'
						height='220'
						density='compact' id='datatable'>
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

					</v-data-table-virtual>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { TLogs } from '@/types';
import { useDisplay } from 'vuetify';

const { smAndDown } = useDisplay();

const errorLog = computed((): Array<TLogs> => adminModule().logs);

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
