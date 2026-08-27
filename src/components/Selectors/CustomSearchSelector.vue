<template>
	<v-text-field
		v-model='searchTerm'
		clearable
		label='search'
		:prepend-inner-icon='mdiMagnify'
		variant='underlined'
		@click:clear='searchTerm = ""'
	/>
</template>

<script setup lang='ts'>
import { mdiMagnify } from '@mdi/js'
import { watchDebounced } from '@vueuse/core'

const mealStore = mealModule()

const searchTerm = ref('')

watchDebounced(searchTerm, (i: string) => {
	mealStore.set_search_by_term(i)
	browserModule().set_pageTitle(i)
}, { debounce: 100 })

// The reset can get called from other modules, so need to watch then reset
const is_filtered = computed(() => mealStore.is_filtered)
watch(is_filtered, (i: boolean) => {
	if (!i) searchTerm.value = ''
})

onMounted(() => {
	if (mealStore.search_by.term) searchTerm.value = mealStore.search_by.term
})

</script>
