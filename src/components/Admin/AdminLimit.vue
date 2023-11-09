<template>
	<v-row wrap justify='center'>
		<v-col cols='12' sm='8' md='6' >
			<v-data-table
				:mobile-breakpoint='0'
				:headers='headers'
				:items='userLimits'
				footer-props.items-per-page-text='abc'
				class='elevation-1 mt-2'
				item-key='users'
			>
				<template v-slot:item='{item}'>
					<tr>
						<td class='text-left'>{{ item.key }}</td>
						<td class='text-center' :class='{"text--mealtype": item.b}'>
							{{ item.points }}
						</td>
						<td class='text-right cl' @click='clearLimit(item.key)'>
							<ButtonIcon color='red' :icon='mdiCloseCircleOutline' />
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { axios_admin } from '@/services/axios';
import { mdiCloseCircleOutline } from '@mdi/js';
import type { TLimit } from '@/types';

const userLimits = computed((): TLimit => {
	return adminModule().limit;
});
	
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
		sortable: false,
	},
] as const;

const clearLimit = async (key: string): Promise<void> => {
	await axios_admin.limit_delete({ key });
};

</script>