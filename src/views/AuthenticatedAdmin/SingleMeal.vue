<template>
	<v-container v-if='dataReady' fluid class='fill-height'>
		<v-row align='center' justify='center' class='no-gutters'>
			<v-col cols='12' sm='10' lg='8'>
				<v-row :justify='lgAndUp ? "space-between" : "center"' class='ma-0 pa-0'>

					<!-- Date -->
					<v-col class='ma-0 pa-0' cols='12' md='5'>
						<v-row justify='space-between' class='ma-0 pa-0'>
							<v-col class='ma-0 pa-0' cols='8'>
								<v-text-field v-model='meal.date' @click='showDate = !showDate'
									:prepend-inner-icon='mdiCalendar' :label='computedDateLabel' variant='underlined'
									density='comfortable' persistent-hint readonly>
									<v-menu v-model='showDate' activator='parent' :close-on-content-click='false'>
										<v-date-picker v-model='mealDate' first-day-of-week='1'
											:min='genesisDateString' />
									</v-menu>
								</v-text-field>
							</v-col>
							<v-col class='ma-0 pa-0 mt-2' cols='3'>
								<v-row justify='space-around' class='ma-0 pa-0'>
									<v-col cols='auto' class='ma-0 pa-0'>
										<v-icon class='' @click='previous' :icon='mdiRestore' />
									</v-col>
									<v-col cols='auto' class='ma-0 pa-0'>
										<v-icon class='' @click='resetDate' :icon='mdiClose' />
									</v-col>
								</v-row>
							</v-col>
						</v-row>
					</v-col>

					<!-- Person -->
					<v-col class='ma-0 pa-0 mr-md-3 mt-2' cols='12' md='6'>
						<v-row justify='space-between' class='ma-0 pa-0'>
							<v-col class='ma-0 pa-0' v-for='(item, index) in ["Dave", "Jack"]' :key='index' cols='auto'>
								<v-radio-group v-model='meal.person' row>
									<v-radio :label='item' :value='item' color='primary' density='compact' />
								</v-radio-group>
							</v-col>
						</v-row>
					</v-col>

					
					<v-row class='ma-0 pa-0' justify='space-between'>

						<!-- Category -->
						<v-col class='ma-0 pa-0' cols='12' md='5' order-md='1' order='2' >
							<v-textarea v-model='meal.category' @blur='trimCategory' :disabled='completed' :auto-grow='true'
								clearable :prepend-inner-icon='mdiFormatListBulletedType' 
								hide-details
								label='category' density='compact' name='category' variant='outlined' type='text'
								rows='1' />
						</v-col>

						<!-- variant -->
						<v-col class='ma-0 pa-0' cols='12' md='6'  order-md='2' order='1'>
							<v-row justify='space-between' class='ma-0 pa-0'>
								<v-col class='ma-0 pa-0' cols='auto' shrink v-for='(item, index) in mealVariants'
									:key='index'>
									<v-switch v-model='meal[item]' :disabled='completed' :label='item' class='ma-0 pa-0'
										color='primary' density='compact' />
								</v-col>
							</v-row>
						</v-col>

					</v-row>
					
					<!-- Category suggestions -->
					<v-col cols='12' class='ma-0 pa-0 mt-md-n5 cat_height'>
						<v-row class='ma-0 pa-0' justify='start'>
							<v-col class='ma-0 pa-0 mr-3' cols='auto' v-for='(item,index) in computedHint' :key='index'>
								<v-chip size='small' density='compact' color='primary' :variant='chipVariant' @click='meal.category = item'>
									{{ item }}
								</v-chip>
							</v-col>
						</v-row>
					</v-col>

					<!-- Description -->
					<v-col class='ma-0 pa-0 mt-1' cols='12' >
						<v-textarea v-model='meal.description' :auto-grow='true' :disabled='completed' density='compact'
							:error='descriptionError'
							:prepend-inner-icon='mdiMessageText' label='meal description' variant='outlined'
							name='description' rows='3' />
					</v-col>

					<!-- Photo section -->
					<v-col cols='12' class='ma-0 pa-0'>
						<v-row align='center' justify='space-between' class='ma-0 pa-0'>

							<!-- Photo -->
							<v-col class='ma-0 pa-0 text-center mb-2' cols='12' md='12' v-if='imageUrl'>
								<v-row justify='center' class='ma-0 pa-0'>
									<v-col cols='6' class='ma-0 pa-0'>
										<v-img :src='imageUrl' max-height='40vh' alt='A photograph of a meal' contain />
									</v-col>
									<v-col class='ma-0 pa-0 text-center mt-2' cols='12' v-if='imageUrl'>
										<v-chip class=''>
											<a target='_blank' :href='env.gen_photo_url(meal.photo_original)'>
												<v-icon :icon='mdiCamera' color='white' class='mr-2' />
												<span class='text-white'>see original</span>
											</a>
										</v-chip>
									</v-col>
								</v-row>
							</v-col>

							<!-- File input / photo name -->
							<v-col class='ma-0 pa-0 mb-n5' :cols='imageUrl ? "12" : "12"'>
								<v-file-input v-if='!imageUrl' v-model='imageToUpload' @change='fileInserted'
									:prepend-icon='``' density='compact'
									:disabled='completed || loading || !meal.person || !meal.date'
									:prepend-inner-icon='mdiAttachment' label='select image'
									accept='image/jpeg,image/jpg' variant='outlined' />

								<v-text-field v-else v-model='meal.photo_original' @click:append-inner='clear'
									:prepend-icon='``' density='compact'
									:append-inner-icon='meal.photo_original ? mdiClose : ""'
									:prepend-inner-icon='mdiAttachment' variant='outlined'
									class='ma-0 pa-0 text-caption' />

							</v-col>
						</v-row>
					</v-col>

					<!-- Buttons -->
					<v-col cols='12' class='ma-0 pa-0 mt-4'>
						<v-row align='center' justify='space-between' class='no-gutters'>
							<v-col cols='12' md='auto' order='3' order-md='1' v-if='editMeal'>
								<v-btn @click='deleteMeal' :block='smAndDown' :disabled='loading || v$.$invalid'
									class='elevation-0 text-black' color='mealtype' rounded large>
									<ButtonIcon color='black' :icon='mdiDeleteOutline' />
									delete
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' :order-md='editMeal ? "3" : "2"'>
								<v-btn @click='cancel' :block='smAndDown' :disabled='loading' class='elevation-0'
									color='error' dark rounded large>
									<ButtonIcon :icon='mdiClose' />
									cancel
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='1' :order-md='editMeal ? "2" : "3"'>
								<v-btn @click='submit' :block='smAndDown' :disabled='submit_disabled'
									:variant='submit_variant' :color='submit_color' class='elevation-0' dark rounded
									large>
									<ButtonIcon :icon='submitIcon' />
									{{ submitText }}
								</v-btn>
							</v-col>
						</v-row>
					</v-col>

				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { axios_adminMeal, axios_adminPhoto } from '@/services/axios';
import { convert_date, todayDateString, genesisDateString } from '@/vanillaTS/helpers';
import { dialoger } from '@/services/dialog';
import { env } from '@/vanillaTS/env';
import { FrontEndRoutes } from '@/types/const_routes';
import { mdiAttachment, mdiCalendar, mdiClose, mdiCloudUpload, mdiDeleteOutline, mdiFormatListBulletedType, mdiMessageText, mdiRestore, mdiDatabaseEdit, mdiPlusCircle, mdiCamera } from '@mdi/js';
import { required } from '@vuelidate/validators';
import { snackError, snackSuccess } from '@/services/snack';
import { useDisplay } from 'vuetify';
import { VBtn } from 'vuetify/components';
import type { PV, TAuthObject, TMealDatePerson, TPerson, TMealPatch, u } from '@/types';
import useVuelidate from '@vuelidate/core';
const { lgAndUp, smAndDown } = useDisplay();

const router = useRouter();
const route = useRoute();

onBeforeUnmount(async () => {
	adminModule().set_date('');
	adminModule().set_person('');
	if (!completed.value && meal.value.photo_converted && meal.value.photo_original) await clear();
});

const submitText = computed(() => editMeal.value ? 'UPDATE' : 'ADD');
const submitIcon = computed(() => editMeal.value ? mdiDatabaseEdit : mdiCloudUpload);

/// Set the pages meal value from a given TMealDatePerson
const meal_from_validated = (x: TMealDatePerson): void => {
	meal.value.category = x.category;
	meal.value.date = x.date;
	meal.value.description = x.description;
	meal.value.vegetarian = x.vegetarian;
	meal.value.takeaway = x.takeaway;
	meal.value.restaurant = x.restaurant;
	meal.value.person = x.person;
	if (x.photo_converted) meal.value.photo_converted = x.photo_converted;
	if (x.photo_original) meal.value.photo_original = x.photo_original;
};

/// Create the patch object from the meal object
const gen_update_meal = (): TMealPatch => {
	const output: TMealPatch = {
		meal: {
			category: meal.value.category,
			date: meal.value.date,
			description: meal.value.description,
			vegetarian: meal.value.vegetarian,
			takeaway: meal.value.takeaway,
			restaurant: meal.value.restaurant,
			person: meal.value.person,
			photo_converted: undefined,
			photo_original: undefined

		},
		original_date: original_date.value
	};
	if (meal.value.photo_converted) output.meal.photo_converted = meal.value.photo_converted;
	if (meal.value.photo_original) output.meal.photo_original = meal.value.photo_original;
	return output;
};

/// Use params in client url to send request to server for that meals info
onBeforeMount(async () => {
	loading.value = true;
	await mealStorage.seed_meal_pinia();
	const person = adminModule().person as TPerson;
	const date = adminModule().date;

	if (person && date) {
		editMeal.value = true;
		const validated = await axios_adminMeal.singleMeal_get({
			date,
			person
		});
		router.replace({
			path: route.path,
			query: {
				person,
				date
			}
		});
		if (validated) {
			original_date.value = validated.date;
			editMealHasPhoto.value = validated.photo_original ? true : false;
			meal_from_validated(validated);
			imageUrl.value = validated.photo_converted ? env.gen_photo_url(validated.photo_converted) : '';
			const browserStore = browserModule();
			browserStore.set_pageTitle(`Edit meal: ${person} ${date}`);
			browserStore.set_description('Meal Pedant - Edit an existing meal');
		} else {
			snackError({ message: 'unknown meal' });
			await router.push(FrontEndRoutes.MEALS);
		}
	}
	if (editMeal.value) {
		browserModule().set_pageTitle('Edit Meal');
		browserModule().set_description('Meal Pedant - Edit an existing meal');
	} else {
		browserModule().set_pageTitle('Add Meal');
		browserModule().set_description('Meal Pedant - Add a new meal');
	}
	dataReady.value = true;
	loading.value = false;
});

/// Add suffix to date box label
const computedDateLabel = computed((): string => {
	if (!meal.value) return '';
	const today_long = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
	const today = today_long.toISOString().slice(0, 10);
	const yesterday = new Date(today_long.setDate(today_long.getDate() - 1)).toISOString().substring(0, 10);
	const text = 'Choose date';
	return meal.value.date === today ? `${text} - today` : meal.value.date === yesterday ? `${text} - yesterday` : text;
});

const categories = computed(() => mealModule().get_all_categories_sorted_alpha);

const chipVariant = computed(() => computedHint.value.length === 1 && meal.value.category.toUpperCase() === computedHint.value[0] ? 'flat' : 'outlined');

/// Generate a hint for the category text box, to show categories names once you start typing
const computedHint = computed(() => {
	if (!meal.value.category) return '';
	const inputLength = meal.value.category.length;
	const input = meal.value.category.toUpperCase().substring(0, inputLength);
	const output = [];
	for (const eachCategory of categories.value) {
		if (eachCategory[1].substring(0, inputLength) === input) {
			output.push(eachCategory[1]);
		}
	}
	return output;
	// return output.length === 1 && output[0] === meal.value.category.toUpperCase() ? [] : output;
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const default_meal = (): TMealDatePerson => {
	return {
		photo_original: undefined as u<string>,
		photo_converted: undefined as u<string>,
		date: todayDateString(),
		category: '',
		description: '',
		restaurant: false,
		takeaway: false,
		vegetarian: false,
		person: '' as TPerson
	};
};

const meal = ref(default_meal());
const completed = ref(false);
const dataReady = ref(false);
const editMealHasPhoto = ref(false);
const imageToUpload = ref(undefined as File | undefined);
const imageUrl = ref('');
const original_date = ref('');
const editMeal = ref(false);
const showDate = ref(false);
const mealDate = ref(undefined as undefined | string);

const descriptionError = ref(false);
watch(meal, (i) => {
	descriptionError.value = i.description.charAt(0) !== i.description.charAt(0).toUpperCase();
	i.description = i.description.trimStart();
}, { deep: true });

watch(mealDate, (i) => {
	if (i) {
		meal.value.date = convert_date(String(i));
		showDate.value = false;
	}
});

const mealVariants = ['restaurant' as const, 'takeaway' as const, 'vegetarian' as const];

/// Remove any uploaded photos, go back to meals back
const cancel = async (): PV => {
	await router.push(FrontEndRoutes.MEALS);
};

/// When image removed from file input, send a request to delete file from sever
const clear = async (): PV => {
	loading.value = true;
	if (!meal.value.photo_original || !meal.value.photo_converted) return;
	if (!editMealHasPhoto.value) {
		axios_adminPhoto.photo_delete({
			original: meal.value.photo_original,
			converted: meal.value.photo_converted
		});
	}
	meal.value.photo_converted = '';
	meal.value.photo_original = '';
	imageUrl.value = '';
	loading.value = false;
};

/// Dialog to ask user if they really want to delete a meal
const deleteMeal = (): void => {
	dialoger({
		message: 'Are you sure you want to delete the meal?',
		buttonText: 'delete',
		title: 'Delete Meal',
		passwordRequired: true,
		confirmFunction: deleteMeal_confirm
	});
};

/// Delete meal completely
/// @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
const deleteMeal_confirm = async (authObject: TAuthObject): PV => {
	loading.value = true;
	if (!meal.value) return;
	const success = await axios_adminMeal.meal_delete({
		person: meal.value.person,
		date: original_date.value,
		auth: authObject
	});
	if (success) {
		snackSuccess({
			message: 'meal deleted',
			type: 'success',
			icon: mdiDeleteOutline
		});
		mealModule().clear_all_filters();
		await router.push(FrontEndRoutes.MEALS);
	}
	loading.value = false;
};

/// Upload image to server, return {o: file_name, c:file_name}
const fileInserted = async (): PV => {
	loading.value = true;
	if (!imageToUpload.value) {
		clear();
		return;
	}
	if (!imageToUpload.value || !meal.value) return;

	if (imageToUpload.value.size > 10240000) {
		snackError({ message: 'filesize too large' });
		return;
	}
	const suffix = imageToUpload.value.type.split('/');
	const fileType = suffix[1]?.toLowerCase();
	if (!fileType) return;

	const acceptable = ['jpeg', 'jpg'];
	if (acceptable.indexOf(fileType) < 0) {
		snackError({ message: 'invalid filetype' });
		return;
	}
	const data = new FormData();
	const newName = `${meal.value.person.substring(0, 1)}.${fileType}`;
	data.append('image', imageToUpload.value, newName);

	const response = await axios_adminPhoto.photo_post(data);
	if (response) {
		[meal.value.photo_original, meal.value.photo_converted] = [response.original, response.converted];
		imageUrl.value = env.gen_photo_url(meal.value.photo_converted);
	}

	imageToUpload.value = undefined;
	loading.value = false;
};

/// Remove whitespace from end of category, when input has been blurred
const trimCategory = (): void => {
	if (meal.value.category) meal.value.category = meal.value.category.trim();
};

/// Post new meal to server
const addMeal = async (): PV => {
	if (v$.value.$invalid) return;
	loading.value = true;
	const response = await axios_adminMeal.meal_post(meal.value);
	if (response) {
		snackSuccess({
			message: 'new meal added',
			type: 'success',
			icon: mdiPlusCircle
		});
		await complete_clear();
		completed.value = true;
		await router.push(FrontEndRoutes.MEALS);
	}
	loading.value = false;
};

/// After add & updated methods, reset infobar, get missing meals, clear the search history, re-seed the data, then search by again using current set filters, if any
const complete_clear = async (): PV => {
	infobarModule().$reset();
	mealModule().clear_search_history();
	await mealStorage.seed_meal_pinia();
	await axios_adminMeal.missing_get();
	if (mealModule().is_filtered) mealModule().filter_by_search_by();
};

const submit_color = computed(() => loading.value || v$.value.$invalid || completed.value ? '' : 'secondary');
const submit_variant = computed((): VBtn['$props']['variant'] => loading.value || v$.value.$invalid || completed.value ? 'outlined' : 'flat');
const submit_disabled = computed((): boolean => loading.value || v$.value.$invalid || completed.value);

/// Either edit or add meal, will show dialog if an edit
const submit = async (): PV => {
	if (editMeal.value) {
		dialoger({
			message: 'Are you sure you want to update this meal?',
			buttonText: 'update',
			title: 'Update Meal',
			passwordRequired: false,
			timeout: 5,
			confirmFunction: updateMeal_confirm
		});
	} else {
		await addMeal();
	}
};

/// Post updated meal to server
const updateMeal_confirm = async (): PV => {
	if (v$.value.$invalid) return;
	loading.value = true;

	if (!meal.value.photo_original) meal.value.photo_original = '';
	if (!meal.value.photo_converted) meal.value.photo_converted = '';
	const success = await axios_adminMeal.meal_patch(gen_update_meal());
	if (success) {
		snackSuccess({
			message: 'meal edited',
			type: 'success',
			icon: mdiDatabaseEdit
		});
		// something here is sometimes causing memory issues
		await complete_clear();
		completed.value = true;
		router.push(FrontEndRoutes.MEALS);
	}
};

/// Roll back the meal date by one
const previous = (): void => {
	if (meal.value.date) {
		const d = new Date(meal.value.date);
		d.setDate(d.getDate() - 1);
		meal.value.date = d.toISOString().slice(0, 10);
	}
};

const resetDate = (): void => {
	if (meal.value.date) meal.value.date = todayDateString();
};

const rules = {
	person: { required },
	category: { required },
	date: { required },
	description: { required }
};

const v$ = useVuelidate(rules, meal);
</script>

<style>

.cat_height {
	height: 1.5rem;
}

@media (max-width: 960px) {
	.v-input--switch .v-label {
		font-size: 12px;
	}
}

@media (max-width: 600px) {
	.v-input--switch .v-label {
		font-size: 10px;
	}
}

.cat_hint .v-messages__message {
	color: rgb(var(--v-theme-primary)) !important;
}
</style>