<template>
	<v-text-field v-model='searchTerm' @click:clear='searchTerm = ""' :prepend-inner-icon='mdiMagnify'
		label='search' variant='underlined' clearable />
</template>

<script setup lang='ts'>
import { mdiMagnify } from '@mdi/js';

const mealStore = mealModule();

const searchTerm = ref('');

watch(searchTerm, (i) => {
	mealStore.set_search_by_term(i);
	browserModule().set_pageTitle(i);
});

/// The reset can get called from other modules, so need to watch then reset
const is_filtered = computed(() => mealStore.is_filtered);
watch(is_filtered, (i) => {
	if (!i) searchTerm.value = '';
});

onMounted(() => {
	if ( mealStore.search_by.term) searchTerm.value = mealStore.search_by.term;
});

</script>
