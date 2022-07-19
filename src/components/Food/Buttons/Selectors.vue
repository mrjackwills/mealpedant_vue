<template>
	<v-col cols='10' class='ma-0 pa-0' >
		<v-row justify='space-around' class='ma-0 pa-0 py-0' >
			<v-col cols='12' sm='7' md='3' class='pa-0'>
				<app-custom-search-selector />
			</v-col>
			<v-col cols='12' sm='7' md='3' class='text-center pa-0'>
				<app-type-selector />
			</v-col>
			<v-col cols='12' sm='7' md='3' class='text-center pa-0'>
				<app-category-selector />
			</v-col>
		</v-row>
	</v-col>
</template>

<script lang='ts'>
import Vue from 'vue';
import CategorySelector from '@/components/Food/FoodSelectors/CategorySelector.vue';
import TypeSelector from '@/components/Food/FoodSelectors/TypeSelector.vue';
import CustomSearchSelector from '@/components/Food/FoodSelectors/CustomSearch.vue';
export default Vue.extend({
	name: 'selectors-row-component',
	components: {
		appCategorySelector: CategorySelector,
		appTypeSelector: TypeSelector,
		appCustomSearchSelector: CustomSearchSelector
	},
});
</script>