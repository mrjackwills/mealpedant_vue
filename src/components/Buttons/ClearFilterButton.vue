<template>
	<v-chip @click='reset' :disabled='!hasFilter' color='error' variant='flat'
		rounded
		:size='chip_size'
	>
		<v-row align='center' justify='space-around' class='px-2'>
			<v-col cols='auto' class='ma-0 pa-0'>
				<ButtonIcon :icon='mdiClose' :size='chip_size' color='white' margin='mr-1' />
			</v-col>
			<v-col cols='auto' class='ma-0 pa-0'>
				clear filters
			</v-col>
		</v-row>
	</v-chip>
</template>

<script setup lang='ts'>
import { mdiClose } from '@mdi/js';
import { useDisplay } from 'vuetify';

const { smAndDown } = useDisplay();

const chip_size = computed(() => smAndDown.value ? 'small' : 'default');

const mealStore = mealModule();
const hasFilter = computed(() => mealStore.is_filtered);

const reset = (): void => mealStore.clear_all_filters();

</script>
