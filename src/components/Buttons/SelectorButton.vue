<template>
	<v-col cols='12' class='ma-0 pa-0' >
		<v-row justify='space-around' class='ma-0 pa-0 py-0' >
			<v-col cols='12' sm='7' md='3' class='pa-0'>
				<CustomSearchSelector />
			</v-col>
			<v-col cols='12' sm='7' md='3' class='text-center pa-0'>
				<TypeSelector />
			</v-col>
			<v-col cols='12' sm='7' md='3' class='text-center pa-0'>
				<CategorySelector />
			</v-col>
		</v-row>
	</v-col>
</template>

<script setup lang='ts'>
</script>