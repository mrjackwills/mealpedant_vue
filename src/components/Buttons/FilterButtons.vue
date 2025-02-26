<template>
	<v-col cols='auto' class='my-0' >
		<v-row justify='center' align='center' class='no-gutters'>
			<v-col v-for='(item, index) in buttonFields.slice(0,3)' :key='index' cols='auto' class='text-center'>
				<v-btn
					@click='click(item.click)'
					:color='item.color'
					:disabled='disabled(item.disabled)'
					:small='mdAndDown'
					:variant='item.variant'
					class='ma-0 mr-1'
					rounded
				>
					<v-row align='center' justify='center'>
						<v-col cols='auto' class='pa-0 ml-1'>
							<ButtonIcon :icon='item.icon' color='black' margin=''/>
						</v-col>
						<v-col cols='auto' class='pa-0 mr-1' >
							<span class='text-black'>{{ item.text }}</span>
						</v-col>
					</v-row>
				</v-btn>
			</v-col>
			<v-col cols='auto' class='text-center' v-if='lgAndUp'>
				<v-btn
					@click='click(buttonFields[3].click)'
					:color='buttonFields[3].color'
					:disabled='disabled(buttonFields[3].disabled)'
					class=''
					:variant='buttonFields[3].variant'
					medium
					rounded
				>
					<v-row align='center' justify='center'>
						<v-col cols='auto' class='pa-1'>
							<ButtonIcon :icon='buttonFields[3].icon' :color='disabled("original")?"error":"white"' margin='' />
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

<script setup lang='ts'>
import { mdiAccountOutline, mdiCamera, mdiRefresh } from '@mdi/js';
import { resetFilters } from '@/services/reset';
import type { TCategory, TMealType, TPiniaDateMeal, TFilterDisabled, TFilterClick } from '@/types';
import { useDisplay } from 'vuetify';
const { lgAndUp, mdAndDown } = useDisplay();

const Dave = computed({
	get (): boolean {
		return foodModule().Dave;
	},
	set (b: boolean): void {
		foodModule().set_Dave(b);
	}
});
const Jack = computed({
	get (): boolean {
		return foodModule().Jack;
	},
	set (b: boolean): void {
		foodModule().set_Jack(b);
	}
});
const original = computed({
	get (): boolean {
		return foodModule().original;
	},
	set (b: boolean): void {
		foodModule().set_original(b);
	}
});
const personDisabled = computed((): boolean => {
	return Dave.value && Jack.value ? false : true;
});
const photoDisabled = computed({
	get (): boolean {
		return foodModule().photo_disabled;
	},
	set (b: boolean): void {
		foodModule().set_photo_disabled(b);
	}
});

const buttonFields = computed(() => {
	return [
		{
			disabled: 'photoDisabled' as TFilterDisabled,
			click: 'removePhotos' as TFilterClick,
			icon: mdiCamera,
			text: 'photos',
			color: 'mealtype',
			variant: disabled('photoDisabled') ? 'outlined' : 'flat'
		},
		{
			disabled: 'personDisabled' as TFilterDisabled,
			click: 'removeJack' as TFilterClick,
			icon: mdiAccountOutline,
			text: 'Dave',
			color: 'primary',
			variant: Dave.value ? 'flat' : 'outlined'
		},
		{
			disabled: 'personDisabled' as TFilterDisabled,
			click: 'removeDave' as TFilterClick,
			icon: mdiAccountOutline,
			text: 'Jack',
			color: 'secondary',
			variant: Jack.value ? 'flat' : 'outlined'
		},
		{
			disabled: 'original' as TFilterDisabled,
			click: 'reset' as TFilterClick,
			icon: mdiRefresh,
			text: 'reset',
			// color: Jack.value? 'secondary':''
			color: 'error',
			variant: disabled('original') ? 'outlined' : 'flat'
		}
	] as const;
});
// 	}),
	
// 	methods: {
const disabled = (x: TFilterDisabled): boolean => {
	switch (x) {
		case 'original':
			return original.value;
		case 'photoDisabled':
			return photoDisabled.value;
		case 'personDisabled':
			return personDisabled.value;
	}
};
const click = (x: TFilterClick): void => {
	switch (x) {
		case 'reset':
			resetFilters();
			break;
		case 'removeDave':
			removeDave();
			break;
		case 'removeJack':
			removeJack();
			break;
		case 'removePhotos':
			removePhotos();
			break;
		default:
			break;
	}
};
const removeJack = (): void => {
	removePerson('Dave');
};
const removeDave = (): void => {
	removePerson('Jack');
};

const removePerson = (person: 'Jack' | 'Dave'): void => {
	const newMealArray: Array<TPiniaDateMeal> = [];
	const filteredTypes = new Set<TMealType>();
	const filteredCategories = new Set<TCategory>();
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
	original.value = false;
	if (personFirstLetter === 'D') Jack.value = false;
	if (personFirstLetter === 'J') Dave.value = false;
};
const removePhotos = (): void => {
	const newMealArray: Array<TPiniaDateMeal> = [];
	const filteredTypes = new Set<TMealType>();
	const filteredCategories = new Set<TCategory>();

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
		} else if (item.D?.p) {
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
		} else if (item.J?.p) {
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
	original.value = false;
	photoDisabled.value = true;
	mealsModule().set_meals(newMealArray);
	categoriesModule().set_categories([ ...filteredCategories ]);
	typesModule().set_types([ ...filteredTypes ]);
};

</script>