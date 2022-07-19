<template>
	<v-col cols='auto' class='my-0' >
		<v-row justify='center' align='center' class='no-gutters'>
			<v-col v-for='(item, index) in buttonFields.slice(0,3)' :key='index' cols='auto' class='text-center'>
				<v-btn
					@click='click(item.click)'
					:color='item.color'
					:disabled='disabled(item.disabled)'
					:small='$vuetify.breakpoint.mdAndDown'
					class='ma-0 mr-1'
					rounded
				>
					<v-row align='center' justify='center'>
						<v-col cols='auto' class='pa-0 ml-1'>
							<app-button-icon :icon='item.icon' :color='returnIconColor(item.icon)' margin=''/>
						</v-col>
						<v-col cols='auto' class='pa-0 mr-1' >
							<div :class='[returnTextColor(item.icon), strikeThrough(item.text)]'>{{ item.text }}</div>
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
			<v-col cols='auto' class='text-center' v-if='$vuetify.breakpoint.lgAndUp'>
				<v-btn
					@click='click(buttonFields[3].click)'
					:color='buttonFields[3].color'
					:disabled='disabled(buttonFields[3].disabled)'
					class=''
					medium
					rounded
				>
					<v-row align='center' justify='center'>
						<v-col cols='auto' class='pa-1'>
							<app-button-icon :icon='buttonFields[3].icon' margin='' />
						</v-col>
						<v-col cols='auto' class='pa-1'>
							<div >{{ buttonFields[3].text }}</div>
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
		</v-row>
	</v-col>
</template>

<script lang='ts'>
import { categoriesModule, foodModule, mealsModule, typesModule } from '@/store';
import { mdiAccountOutline, mdiCamera, mdiRefresh } from '@mdi/js';
import { resetFilters } from '@/services/reset';
import { TCategory, TMealType, TPiniaDateMeal, TFilterDisabled, TFilterClick } from '@/types';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'filter-buttons-row-component',

	components: {
		appButtonIcon: ButtonIcon
	},
	
	computed: {
	
		Dave: {
			get: function (): boolean {
				return foodModule().Dave;
			},
			set: function (b: boolean): void {
				foodModule().set_Dave(b);
			}
		},
		Jack: {
			get: function (): boolean {
				return foodModule().Jack;
			},
			set: function (b: boolean): void {
				foodModule().set_Jack(b);
			}
		},
		original: {
			get: function (): boolean {
				return foodModule().original;
			},
			set: function (b: boolean): void {
				foodModule().set_original(b);
			}
		},
		personDisabled (): boolean {
			return this.Dave && this.Jack? false: true;
		},
		photoDisabled: {
			get: function (): boolean {
				return foodModule().photo_disabled;
			},
			set: function (b: boolean): void {
				foodModule().set_photo_disabled(b);
			}
		},
	},

	data: () => ({
		buttonFields: [
			{
				disabled: 'photoDisabled' as TFilterDisabled,
				click: 'removePhotos' as TFilterClick,
				icon: mdiCamera,
				text: 'photos',
				color: 'mealtype'
			},
			{
				disabled: 'personDisabled' as TFilterDisabled,
				click: 'removeJack' as TFilterClick,
				icon: mdiAccountOutline,
				text: 'Dave',
				color: 'primary'
			},
			{
				disabled: 'personDisabled' as TFilterDisabled,
				click: 'removeDave' as TFilterClick,
				icon: mdiAccountOutline,
				text: 'Jack',
				color: 'secondary'
			},
			{
				disabled: 'original' as TFilterDisabled,
				click: 'reset' as TFilterClick,
				icon: mdiRefresh,
				text: 'reset',
				color: 'error',
				flat: true
			}
		] as const,
	}),
	
	methods: {
		disabled (x: TFilterDisabled): boolean {
			switch (x) {
			case 'original':
				return this.original;
				break;
			case 'photoDisabled':
				return this.photoDisabled;
				break;
			case 'personDisabled':
				return this.personDisabled;
				break;
			}
		},
		click (x: TFilterClick): void {
			switch (x) {
			case 'reset':
				resetFilters();
				break;
			case 'removeDave':
				this.removeDave();
				break;
			case 'removeJack':
				this.removeJack();
				break;
			case 'removePhotos':
				this.removePhotos();
				break;
			default:
				break;
			}
		},
		removeJack (): void {
			this.removePerson('Dave');
		},
		removeDave (): void {
			this.removePerson('Jack');
		},
		strikeThrough (person: string): string|void {
			switch (person) {
			case 'Jack':
				return this.Jack ? '' : 'text-decoration-line-through';
				break;
			case 'Dave':
				return this.Dave ? '' : 'text-decoration-line-through';
				break;
			}
		},
		removePerson (person: 'Jack' | 'Dave'): void {
			const newMealArray: Array<TPiniaDateMeal> = [];
			const filteredTypes: Set<TMealType> = new Set();
			const filteredCategories: Set<TCategory> = new Set();
			const personFirstLetter = person.substring(0, 1) as 'J' | 'D';

			for (const item of mealsModule().meals) {
				if (item[personFirstLetter]) {
					newMealArray.push({
						da: item.da,
						[personFirstLetter]: item[personFirstLetter]
					});
					if (item[personFirstLetter]?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item[personFirstLetter]?.r) filteredTypes.add('restaurant');
					if (item[personFirstLetter]?.t) filteredTypes.add('takeout');
					if (item[personFirstLetter]?.v) filteredTypes.add('vegetarian');
				}
			}
			mealsModule().set_meals(newMealArray);
			categoriesModule().set_categories([ ...filteredCategories ]);
			typesModule().set_types([ ...filteredTypes ]);
			this.original = false;
			if (personFirstLetter === 'D') this.Jack = false;
			if (personFirstLetter === 'J') this.Dave = false;
		},
		removePhotos (): void {
			const newMealArray: Array<TPiniaDateMeal> = [];
			const filteredTypes: Set<TMealType> = new Set();
			const filteredCategories: Set<TCategory> = new Set();

			for (const item of mealsModule().meals) {
				if (item.D?.p && item.J?.p) {
					newMealArray.push(item);
					if (item.D?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item.J?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item.J?.r || item.D?.r) filteredTypes.add('restaurant');
					if (item.J?.t || item.D?.t) filteredTypes.add('takeout');
					if (item.J?.v || item.D?.v) filteredTypes.add('vegetarian');
				}
				else if (item.D?.p) {
					newMealArray.push(
						{
							da: item.da,
							D: item.D
						});
					if (item.D?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item.D?.r) filteredTypes.add('restaurant');
					if (item.D?.t) filteredTypes.add('takeout');
					if (item.D?.v) filteredTypes.add('vegetarian');
				}
				else if (item.J?.p) {
					newMealArray.push(
						{
							da: item.da,
							J: item.J
						});
					if (item.J?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item.J?.r) filteredTypes.add('restaurant');
					if (item.J?.t) filteredTypes.add('takeout');
					if (item.J?.v) filteredTypes.add('vegetarian');
				}
			}
			this.original = false;
			this.photoDisabled = true;
			mealsModule().set_meals(newMealArray);
			categoriesModule().set_categories([ ...filteredCategories ]);
			typesModule().set_types([ ...filteredTypes ]);
		},
		returnTextColor (item: string): string {
			return item === mdiAccountOutline && this.Jack && this.Dave || item === mdiCamera && !this.photoDisabled ? 'black--text': '';
		},
		returnIconColor (item: string): string {
			return item === mdiAccountOutline && this.Jack && this.Dave || item === mdiCamera && !this.photoDisabled ? 'black': '';
		},
	},
});
</script>