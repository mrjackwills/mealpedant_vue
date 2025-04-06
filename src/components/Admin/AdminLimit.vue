<template>
	<v-row wrap justify='center'>
		<v-col cols='12' sm='8' md='6'>
			<v-data-table-virtual height='220' :headers='headers' :items='userLimits' class='elevation-1 mt-2' item-key='users'
				density='compact'>
				<template v-slot:item='{ item }'>
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
import { axios_admin } from '@/services/axios';
import { mdiCloseCircleOutline } from '@mdi/js';
import type { PV, TLimit } from '@/types';

const userLimits = computed((): TLimit => adminModule().limit);

const headers = [
	{
		title: 'key',
		align: 'start',
		sortable: true,
		value: 'key'
	},
	{
		title: 'points',
		align: 'center',
		sortable: true,
		value: 'points'
	},
	{
		title: 'clear',
		align: 'end',
		sortable: false
	}
] as const;

const clearLimit = async (key: string): PV => {
	await axios_admin.limit_delete({ key });
};

</script>