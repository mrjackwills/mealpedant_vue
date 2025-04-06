<template>
	<v-select v-model='selectedType' @click:clear='reset' @update:modelValue='typeSearch' :items='types'
		:disabled='disabled'
		:prepend-inner-icon='mdiStarThreePointsOutline'
		no-data-text='hide-no-date' 
		variant='underlined' 
		:menu-props='{ maxHeight: "400" }' item-text='t' item-value='v' :label='label'
		clearable />
</template>

<script setup lang='ts'>
import { PV, TMealVariant } from '@/types';
import { mdiStarThreePointsOutline } from '@mdi/js';

const mealStore = mealModule();
const selectedType = ref(undefined as undefined | TMealVariant);
const types = computed(() => mealStore.get_meal_types);

const disabled = computed(() => types.value.length === 0);
const label = computed(() => disabled.value ? 'no match' : 'variant');

const reset = async (): PV => {
	mealStore.clear_all_filters();
};

/// The reset can get called from other modules, so need to watch then reset
const is_filtered = computed(() => mealModule().is_filtered);
watch(is_filtered, (i) => {
	if (!i) {
		selectedType.value = undefined;
	}
});

const typeSearch = (): void => {
	if (selectedType.value) {
		if (selectedType.value === 'restaurant') {
			mealStore.set_search_by_restaurant();
		}
		if (selectedType.value === 'takeaway') {
			mealStore.set_search_by_takeaway();
		}
		if (selectedType.value === 'vegetarian') {
			mealStore.set_search_by_vegetarian();
		}
	}
};

</script>