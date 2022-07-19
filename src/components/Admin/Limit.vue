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
						<td class='text-center' :class='{"mealtype--text": item.b}'>
							{{ item.points }}
						</td>
						<td class='text-right cl' @click='clearLimit(item.key)'>
							<app-button-icon color='red' :icon='mdiCloseCircleOutline' />
						</td>
					</tr>
				</template>
			</v-data-table>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { adminModule, loadingModule } from '@/store';
import { axios_admin } from '@/services/axios';
import { mdiCloseCircleOutline } from '@mdi/js';
import { secondsToDays } from '@/vanillaTS/secondsToDays';
import { TLimit } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'admin-user-limits-component',

	components: {
		appButtonIcon: ButtonIcon
	},

	computed: {
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		userLimits (): TLimit {
			return adminModule().limit;
		},
	},
	
	data: () => ({
		mdiCloseCircleOutline,
		headers: [
			{
				text: 'key',
				align: 'left',
				sortable: true,
				value: 'key'
			},
			{
				text: 'points',
				align: 'center',
				sortable: true,
				value: 'points'
			},
			{
				text: 'clear',
				align: 'right',
				sortable: false,
			},
		],
	}),

	filters: {
		/**
		 ** convert miliseconds to day(s), hour(s), minute(s), second(s)
		 */
		secondsToDays (s: number): string {
			return secondsToDays(s);
		}
	},

	methods: {
		async clearLimit (key: string): Promise<void> {
			await axios_admin.limit_delete({ key });
		},
	},

});

</script>