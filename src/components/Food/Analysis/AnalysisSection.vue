<template>
	<v-row justify='space-between' class='ma-0 pa-0 mb-3'>
		<v-col cols='12' class='ma-0 pa-0 pb-3 pb-md-0 pr-md-3' :md='totals_cols'>
			<VariantsTable />
		</v-col>
		<v-col cols='12' class='ma-0 pa-0' :md='categories_cols'>
			<CategoriesTable />
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
const authenticated = computed(() => userModule().authenticated);

const totals_cols = computed(() => authenticated ? '6' : '3');
const categories_cols = computed(() => authenticated ? '6' : '9');
</script>