<template>
	<v-row justify='center' wrap>
		<v-col cols='12' md='6' sm='8'>
			<v-data-table-virtual
				class='elevation-1 mt-2'
				density='compact'
				:headers
				height='220'
				item-key='users'
				:items='userLimits'
			>
				<template #item='{ item }'>
					<tr>
						<td class='text-left'>{{ item.key }}</td>
						<td class='text-center'>
							{{ item.points }}
						</td>
						<td class='text-right cl' @click='clearLimit(item.key)'>
							<ButtonIcon color='red' :icon='mdiCloseCircleOutline' />
						</td>
					</tr>
				</template>
			</v-data-table-virtual>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import type { PV, TLimit } from '@/types'
import { mdiCloseCircleOutline } from '@mdi/js'
import { axios_admin } from '@/services/axios'

const userLimits = computed((): TLimit => adminModule().limit)

const headers = [
	{
		title: 'key',
		align: 'start',
		sortable: true,
		value: 'key',
	},
	{
		title: 'points',
		align: 'center',
		sortable: true,
		value: 'points',
	},
	{
		title: 'clear',
		align: 'end',
		sortable: false,
	},
] as const

async function clearLimit (key: string): PV {
	await axios_admin.limit_delete({ key })
}

</script>
