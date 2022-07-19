<template>
	<v-row
		align='center'
		justify='center'>
		<v-col cols='auto' class='cl'>
			<v-btn
				color='infobar'
				small
				@click='doThing'
			>
				<app-button-icon
					:icon='mdiDatabaseRefresh'
					:small='true'
				/>
				force data refresh
			</v-btn>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { dexieDB } from '@/services/dexieDB';
import { mdiDatabaseRefresh } from '@mdi/js';
import { resetFilters } from '@/services/reset';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'refresh-data',

	components: {
		appButtonIcon: ButtonIcon,
	},

	data: () => ({
		mdiDatabaseRefresh,
	}),

	methods: {
		async doThing (): Promise<void> {
			await dexieDB.clear_all();
			await dexieDB.check_last_id();
			await resetFilters();
		}
	}
});
</script>