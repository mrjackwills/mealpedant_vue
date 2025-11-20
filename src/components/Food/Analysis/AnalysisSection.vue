<template>
	<v-row class='ma-0 pa-0 mb-3' justify='center'>
		<v-col class='ma-0 pa-0 pb-3 pb-md-0 pr-md-3' cols='12' :md='totals_cols'>
			<VariantsTable />
		</v-col>
		<v-col class='ma-0 pa-0' cols='12' :md='categories_cols'>
			<CategoriesTable />
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
const authenticated = computed(() => userModule().authenticated)

const totals_cols = computed(() => authenticated ? '6' : '3')
const categories_cols = computed(() => authenticated ? '6' : '9')
</script>
