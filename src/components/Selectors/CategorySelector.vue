<template>
	<v-select
		v-model.lazy='selected_category'
		clearable
		:disabled
		:items='category_names'
		:label
		:menu-props='{ maxHeight: max_height }'
		:prepend-inner-icon='mdiFormatListBulletedType'
		variant='underlined'
		@click:clear='reset'
		@update:model-value='update_categories'
	/>
</template>

<script setup lang='ts'>
import { mdiFormatListBulletedType } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { formatCategoryName } from '@/vanillaTS/helpers'

const selected_category = ref(undefined as undefined | string)
const mealStore = mealModule()

const categories = computed(() => mealStore.get_all_filtered_categories_sorted_alpha)

function update_categories (): void {
	if (selected_category.value) mealStore.set_search_by_category(selected_category.value.toUpperCase())
}

// The reset can get called from other modules, so need to watch then reset
const is_filtered = computed(() => mealStore.is_filtered)
watch(is_filtered, (i: boolean) => {
	if (!i) selected_category.value = undefined
})

const disabled = computed(() => categories.value.length === 0)
const label = computed(() => disabled.value ? 'no match' : 'category')

const category_names = computed(() => categories.value.map(i => formatCategoryName(i[1])))

function reset (): void {
	mealStore.clear_all_filters()
	selected_category.value = undefined
}

const max_height = computed(() => `${useDisplay().height.value * 0.66}px`)

</script>
