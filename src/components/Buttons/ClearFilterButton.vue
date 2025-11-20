<template>
	<v-chip
		color='error'
		:disabled='!hasFilter'
		rounded
		:size='chip_size'
		variant='flat'
		@click='reset'
	>
		<v-row align='center' class='px-2' justify='space-around'>
			<v-col class='ma-0 pa-0' cols='auto'>
				<ButtonIcon color='white' :icon='mdiClose' margin='mr-1' :size='chip_size' />
			</v-col>
			<v-col class='ma-0 pa-0' cols='auto'>
				clear filters
			</v-col>
		</v-row>
	</v-chip>
</template>

<script setup lang='ts'>
import { mdiClose } from '@mdi/js'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const chip_size = computed(() => smAndDown.value ? 'small' : 'default')

const mealStore = mealModule()
const hasFilter = computed(() => mealStore.is_filtered)

const reset = (): void => mealStore.clear_all_filters()

</script>
