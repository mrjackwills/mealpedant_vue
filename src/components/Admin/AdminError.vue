<template>
	<v-row class='no-gutters' justify='center'>
		<v-col class='' cols='12' md='10'>
			<v-row class='no-gutters' justify='center'>
				<v-col cols='12'>
					<v-data-table-virtual
						id='datatable'
						class='elevation-1 mt-4'
						density='compact'
						:headers
						height='220'
						:items='errorLog'
						:mobile='smAndDown'
					>
						<template #[`item.timestamp`]='{ item }'>
							<div class=''>{{ item.timestamp }}</div>
						</template>

						<template #[`item.level`]='{ item }'>
							<div :class='item.level === "ERROR" ? "text-mealtype" : ""'>{{ item.level }}</div>
						</template>
						<template #[`item.fields`]='{ item }'>
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
import type { TLogs } from '@/types'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const errorLog = computed((): Array<TLogs> => adminModule().logs)

const headers = [
	{
		title: 'timestamp',
		align: 'start',
		sortable: true,
		value: 'timestamp',
	},
	{
		title: 'level',
		align: 'start',
		sortable: true,
		value: 'level',
	},
	{
		title: 'message',
		align: 'start',
		sortable: true,
		value: 'fields',
	},
] as const

</script>
