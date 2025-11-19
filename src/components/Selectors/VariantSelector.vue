<template>
	<v-select
		v-model='selectedType'
		clearable
		:disabled
		item-text='t'
		item-value='v'
		:items='types'
		:label
		:menu-props='{ maxHeight: "400" }'
		no-data-text='hide-no-date'
		:prepend-inner-icon='mdiStarThreePointsOutline'
		variant='underlined'
		@click:clear='reset'
		@update:model-value='typeSearch'
	/>
</template>

<script setup lang='ts'>
import type { PV, TMealVariant } from '@/types'
import { mdiStarThreePointsOutline } from '@mdi/js'

const mealStore = mealModule()
const selectedType = ref(undefined as undefined | TMealVariant)
const types = computed(() => mealStore.get_meal_types)

const disabled = computed(() => types.value.length === 0)
const label = computed(() => disabled.value ? 'no match' : 'variant')

async function reset (): PV {
	mealStore.clear_all_filters()
}

// The reset can get called from other modules, so need to watch then reset
const is_filtered = computed(() => mealModule().is_filtered)
watch(is_filtered, (i: boolean) => {
	if (!i) {
		selectedType.value = undefined
	}
})

function typeSearch (): void {
	if (selectedType.value) {
		if (selectedType.value === 'restaurant') {
			mealStore.set_search_by_restaurant()
		}
		if (selectedType.value === 'takeaway') {
			mealStore.set_search_by_takeaway()
		}
		if (selectedType.value === 'vegetarian') {
			mealStore.set_search_by_vegetarian()
		}
	}
}

</script>
