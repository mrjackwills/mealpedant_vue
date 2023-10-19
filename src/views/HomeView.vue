<template>
	<v-container fluid class='ma-0 pa-0 no-gutters fill-height' >
		<v-row
			align='center'
			justify='center'
		>
			<v-col
				cols='12'
				align='center'
				justify='center'
			>
				<p class='text-center text-white'>
					Since May 9th 2015, two transatlantic friends have pedantically exchanged information on every evening meal that they have consumed.
					This is a comprehensive chronicling of that pedantry.
				</p>
			</v-col>
		</v-row>
	</v-container>
</template>
<script setup lang='ts'>
const browserStore = browserModule();

onMounted(() => {
	browserStore.set_pageTitle('Home');
	browserStore.set_description('Meal Pedant Home Page');
});

</script>