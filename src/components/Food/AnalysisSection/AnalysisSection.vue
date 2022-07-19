<template>
	<v-row justify='center' class='ma-0 pa-0 my-0'>
		<v-col cols='12' class='py-0 ma-0'>
			<app-totals-table />
		</v-col>
		<v-btn
			@click='showAnalysys'
			:color='computedButtonColor'
			class='ma-0 my-2 black--text elevation-0'
			rounded
			small
		>
			<v-row align='center' justify='center'>
				<v-col cols='auto' class='pa-0 ml-1'>
					<app-button-icon :icon='mdiTableLarge' :color='categoryTableVisible? "white": "black"'/>
				</v-col>
				<v-col cols='auto' class='pa-0 mr-1' >
					<div :class='computedButtonColortext'>{{ computedButtonLabel }} category analysis</div>
				</v-col>
			</v-row>
		</v-btn>
		<v-col cols='12' class='py-0'>
			<v-expand-transition>
				<app-category-table v-show='categoryTableVisible' />
			</v-expand-transition>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { mdiTableLarge } from '@mdi/js';
import ButtonIcon from '@/components/ButtonIcon.vue';
import CategoryTable from '@/components/Food/AnalysisSection/CategoryTable/CategoryTable.vue';
import TotalsTable from '@/components/Food/AnalysisSection/TotalsTable/TotalsTable.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'analysis-section-component',
	components: {
		appButtonIcon: ButtonIcon,
		appCategoryTable: CategoryTable,
		appTotalsTable: TotalsTable
	},

	computed: {
		computedButtonColor (): string {
			return this.categoryTableVisible ? 'black' : 'mealtype';
		},
		computedButtonColortext (): string {
			return this.categoryTableVisible ? 'white--text' : 'black--text';
		},
		computedButtonLabel (): string {
			return this.categoryTableVisible ? 'hide' : 'show';
		}
	},

	data: () => ({
		categoryTableVisible: false,
		mdiTableLarge,
	}),

	methods: {
		showAnalysys (): void {
			this.categoryTableVisible = !this.categoryTableVisible;
		}
	},
});
</script>

<style >
@media (max-width: 960px) {
	#headers th, #headers td{
		padding: 10px;
	}
}
</style>