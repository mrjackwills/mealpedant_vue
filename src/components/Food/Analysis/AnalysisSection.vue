<template>
	<v-row justify='center' class='ma-0 pa-0 my-0'>
		<v-col cols='12' class='py-0 ma-0'>
			<TotalsTable />
		</v-col>
		<v-btn
			@click='showAnalysis'
			:color='computedButtonColor'
			class='ma-0 my-2 black--text elevation-0'
			rounded
			small
		>
			<v-row align='center' justify='center'>
				<v-col cols='auto' class='pa-0 ml-1'>
					<ButtonIcon :icon='mdiTableLarge' :color='categoryTableVisible? "white": "black"'/>
				</v-col>
				<v-col cols='auto' class='pa-0 mr-1' >
					<div :class='computedButtonColortext'>{{ computedButtonLabel }} category analysis</div>
				</v-col>
			</v-row>
		</v-btn>
		<v-col cols='12' class='ma-0 pa-0'>
			<v-expand-transition>
				<CategoriesTable v-show='categoryTableVisible' />
			</v-expand-transition>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiTableLarge } from '@mdi/js';

const computedButtonColor = computed((): string => {
	return categoryTableVisible.value ? 'black' : 'mealtype';
});
const computedButtonColortext = computed((): string => {
	return categoryTableVisible.value ? 'white--text' : 'black--text';
});
const computedButtonLabel = computed((): string => {
	return categoryTableVisible.value ? 'hide' : 'show';
});

const categoryTableVisible = ref(false);
const showAnalysis = (): void => {
	categoryTableVisible.value = !categoryTableVisible.value;
};
</script>

<style >
@media (max-width: 960px) {
	#headers th, #headers td{
		padding: 10px;
	}
}
</style>