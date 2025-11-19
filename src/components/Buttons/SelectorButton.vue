<template>
	<v-col class='ma-0 pa-0' cols='12'>
		<v-row class='ma-0 pa-0 py-0' justify='space-around'>
			<v-col class='pa-0 mb-n2' cols='11' md='3' sm='7'>
				<CustomSearchSelector />
			</v-col>
			<v-col class='pa-0 mb-n2' cols='11' md='3' sm='7'>
				<VariantSelector />
			</v-col>
			<v-col class='pa-0 mb-n2' cols='11' md='3' sm='7'>
				<CategorySelector />
			</v-col>
		</v-row>
	</v-col>
</template>

<script setup lang='ts'>
</script>
