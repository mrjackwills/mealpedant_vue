<template>
	<v-data-table
		v-if='tableData'
		:footer-props='footerProps'
		:headers='headers'
		:items.sync='tableData'
		:items-per-page='20'
		:mobile-breakpoint='0'
		class='elevation-1'
		item-key='d'
		calculate-widths
	>
		<template v-slot:[`item.da`]='{ item }'>
			<div v-if='item.D || item.J' class='py-2'>
				<v-row align='start' justify='start' class='no-gutters ma-0 pa-0'>
					<div class='' :class='computedPadding'>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont' >{{ item.da | filteredDay }}</div>
						</v-col>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont' >{{ item.da | filteredDate }}</div>
						</v-col>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont' >{{ item.da | filteredYear }}</div>
						</v-col>
						<v-col cols='12' class='pa-0'>
							<div class='ml-1' :class='computedDateFont'> day: {{ item.da | filteredDayNumber }}</div>
						</v-col>
					</div>
				</v-row>
			</div>
		</template>
		
		<template v-if='Dave ' v-slot:[`item.D`]='{ item }'>
			<div v-if='item.D'>
				<app-meal-description
					:category='item.D.c'
					:date='item.da'
					:description='item.D.md'
					:photo='item.D.p ? item.D.p : {}'
					:restaurant='item.D.r'
					:takeaway='item.D.t'
					:vegetarian='item.D.v'
					person='D'
				/>
			</div>
		</template>

		<template v-if='Jack' v-slot:[`item.J`]='{ item }'>
			<div v-if='item.J'>
				<app-meal-description
					:category='item.J.c'
					:date='item.da'
					:description='item.J.md'
					:photo='item.J.p ? item.J.p : {}'
					:restaurant='item.J.r'
					:takeaway='item.J.t'
					:vegetarian='item.J.v'
					person='J'
				/>
			</div>
		</template>

		<template v-if='!Dave && !Jack'>
			nothing
		</template>
	</v-data-table>
</template>

<script lang='ts'>
import { foodModule, loadingModule, mealsModule } from '@/store';
import { genesisDate, months, days } from '@/vanillaTS/globalConsts';
import { TFooterProps, TPiniaDateMeal, THeader, TPerson } from '@/types';
import MealDescription from '@/components/Food/DataTable/MealDescription.vue';
import Vue from 'vue';
export default Vue.extend({
	name: 'data-table',
	
	components: {
		appMealDescription: MealDescription
	},

	computed: {
		// Shrink date font on small screens
		computedDateFont (): string {
			return this.$vuetify.breakpoint.mdAndDown ? 'smallesttext': 'smalltext';
		},
		// Padding shrink on small screens - used for date cell
		computedPadding (): string {
			return this.$vuetify.breakpoint.mdAndDown ? 'pa-1': 'pa-2';
		},
		// All Dave meals visible status, set&get
		Dave: {
			get: function (): boolean {
				return foodModule().Dave;
			},
			set: function (b: boolean): void {
				foodModule().set_Dave(b);
			}
		},
		// photo dialog status
		dialog: {
			get: function (): boolean {
				return foodModule().dialog;
			},
			set: function (b: boolean): void {
				foodModule().set_dialog(b);
			}
		},
		footerProps (): TFooterProps {
			return {
				itemsPerPageOptions: [ 10, 20, 30, -1 ],
				itemsPerPageText: this.$vuetify.breakpoint.mdAndUp ? 'days per page' : 'days',
			};
		},
		headers (): THeader {
			const headers = [];
			headers.push(
				{
					align: 'left' as const,
					class: '',
					sortable: true,
					text: 'Date' as const,
					value: 'da',
					width: '10%'
				},
			);
			if (this.Dave) headers.push(
				{
					align: 'left' as const,
					class: 'dave-header',
					sortable: false,
					text: 'Dave' as TPerson,
					value: 'D',
					width: this.Jack ? '45%' : '90%',

				}
			);

			if (this.Jack) headers.push(
				{
					align: 'left' as const,
					class: 'jack-header',
					sortable: false,
					text: 'Jack' as TPerson,
					value: 'J',
					width: this.Dave ? '45%' : '90%'
				}
			);
			return headers;
		},
		// All Jack meals visible status, set&get
		Jack: {
			get: function (): boolean {
				return foodModule().Jack;
			},
			set: function (b: boolean): void {
				foodModule().set_Jack(b);
			}
		},
		// Global loading boolean, get&set
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},

		photoDisabled: {
			get: function (): boolean {
				return foodModule().photo_disabled;
			},
			set: function (b: boolean): void {
				foodModule().set_photo_disabled(b);
			}
		},

		tableData (): Array<TPiniaDateMeal> {
			return mealsModule().meals;
		},
	},

	// instead these can be computed
	filters: {
		filteredDate (a: string): string {
			const mealDate = new Date(a);
			return `${mealDate.getUTCDate() } ${months[mealDate.getUTCMonth()]}`;
		},
		filteredDay (a: string): string {
			return `${days[new Date(a).getUTCDay()]}`;
		},
		filteredDayNumber (a: string): number {
			const end = new Date(a).getTime();
			return Math.ceil((end - genesisDate) / 1000 / 60 / 60 / 24) + 1;
		},
		filteredYear (a: string): string {
			return String(new Date(a).getUTCFullYear());
		},
	},

});
</script>

<style>

.dave-header, .jack-header {
	font-size: 1rem
}

.dave-header {
	color: #c6c490 !important;
}
.jack-header {
	color: #7ca1b2 !important;
}
</style>
