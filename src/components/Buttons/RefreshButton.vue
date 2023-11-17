<template>
	<v-row
		align='center'
		justify='center'>
		<v-col cols='auto' class='cl'>
			<v-btn
				@click='refresh'
				variant='flat'
				color='infobar'
				small

			>
				<ButtonIcon
					:icon='mdiDatabaseRefresh'
					:small='true'
				/>
				force data refresh
			</v-btn>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { dexieDB } from '@/services/dexieDb';
import { mdiDatabaseRefresh } from '@mdi/js';
import { resetFilters } from '@/services/reset';
const refresh = async (): Promise<void> => {
	await dexieDB.clear_all();
	await dexieDB.check_last_id();
	await resetFilters();
};
</script>