<template>
	<v-container
		v-if='dataReady && meal'
		container--fluid
		fill-height
	>
		<v-row align='center' justify='center' class='no-gutters'>
			<v-col class='' cols='12' sm='8' md='6'>
				<v-form
					v-on:submit.prevent>
					<v-col class='pa-0' cols='12'>

						<v-row justify='space-between' class='ma-0 pa-0'>
							<v-col class='ma-0 pa-0' cols='11'>

								<v-text-field
									v-model='meal.date'
									@click='showDate=!showDate'
									:prepend-icon='mdiCalendar'
									:label='computedDateLabel'
									variant='underlined'
									persistent-hint
									readonly
								>
									<v-menu
										v-model='showDate'
										activator='parent'
										:close-on-content-click='false'
									>
										<v-date-picker
											v-model='mealDate'
											first-day-of-week='1'
											@click:cancel='showDate=!showDate'
											@click:save='showDate=!showDate'
											:min='minDate'
										/>
									</v-menu>
								</v-text-field>

							</v-col>
							<v-col class='ma-0 pa-0' cols='auto'>
								<v-icon class='mt-5' @click='previous' :icon='mdiRestore' />

							</v-col>
						</v-row>

						<!-- <v-text-field
							v-model='meal.date'
							@click:append-inner='yesterday'
							@click='showDate=!showDate'
							:append-inner-icon='mdiRestore'
							:prepend-icon='mdiCalendar'
							:label='computedDateLabel'
							variant='underlined'
							persistent-hint
							readonly
						>

							<v-menu
								v-model='showDate'
								activator='parent'
								:close-on-content-click='false'
							>
								<v-date-picker
									v-model='mealDate'
									first-day-of-week='1'
									@click:cancel='showDate=!showDate'
									@click:save='showDate=!showDate'
									@update:modelValue='showDate=false'
									:min='minDate'
								/>
							</v-menu>
						</v-text-field> -->
						<v-col class='pa-0' cols='12'>
							<v-row justify='space-around'>
								<v-col class='pa-0' v-for='(item,index) in ["Dave", "Jack"]' :key='index' cols='auto'>
									<v-radio-group v-model='meal.person' row >
										<v-radio
											:label='item'
											:value='item'
											color='primary'
										/>
									</v-radio-group>
								</v-col>
							</v-row>
						</v-col>
						<v-col class='pa-0' cols='12'>
							<v-row justify='space-around'>
								<v-col class='pa-0' cols='auto' shrink v-for='(item,index) in mealTypes' :key='index'>
									<v-switch
										v-model='meal[item]'
										:disabled='completed'
										:label='item'
										color='primary'
									>
									</v-switch>
								</v-col>
							</v-row>
						</v-col>
					</v-col>
					<v-col class='pa-0' cols='12'>
						<v-text-field
							v-model='meal.category'
							@blur='trimCategory'
							:disabled='completed'
							:prepend-icon='mdiFood'
							:suffix='computedSuffix'
							name='category'
							label='CATEGORY'
							variant='underlined'
							type='text'
						>
						</v-text-field>
					</v-col>
					<v-col class='pa-0' cols='12'>
						<v-textarea
							v-model='meal.description'
							:auto-grow='true'
							:disabled='completed'
							:prepend-icon='mdiMessageText'
							label='MEAL DESCRIPTION'
							variant='underlined'
							name='description'
							rows='3'
						/>
					</v-col>
				</v-form>
				<v-expand-transition>
					<v-row justify='center' align='center' class='no-gutters ma-0 pa-0' v-if='imageUrl'>
						<v-col class='ma-0 pa-0' cols='8'>
							<v-img
								:src='imageUrl'
								alt='A photograph of a meal'
								min-width='100%'
								contain
							/>
						</v-col>
					</v-row>
				</v-expand-transition>
				<v-col class='pa-0' cols='12'>
					<v-file-input
						v-if='!imageUrl'
						v-model='imageToUpload'
						@change='fileInserted'
						:disabled='completed || loading || !meal.person || !meal.date'
						:prepend-icon='mdiAttachment'
						label='SELECT IMAGE'
						accept='image/jpeg,image/jpg'
						variant='underlined'
					/>
					<v-text-field
						v-else
						v-model='meal.photo_original'
						@click:append-inner='clear'
						:append-inner-icon='meal.photo_original ? mdiClose: ""'
						:prepend-icon='mdiAttachment'
						variant='underlined'
					/>
				</v-col>
				<v-col class='pa-0' cols='12' v-if='!completed'>
					<div class='text-center mt-3'>
						<v-row align='center' justify='space-around' class='no-gutters'>
							<v-col cols='12' md='auto' order='3' order-md='1'>
								<v-btn
									@click='deleteMeal'
									:block='smAndDown'
									:class='{"elevation-0": loading || v$.$invalid, "mt-4" : smAndDown }'
									:disabled='loading || v$.$invalid'
									class='elevation-2 black--text'
									color='primary'
									large
								>
									<ButtonIcon color='black' :icon='mdiDeleteForever' />
									delete
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='2'>
								<v-btn
									@click='cancel'
									:class='{"elevation-0": loading, "mt-4" : smAndDown }'
									:block='smAndDown'
									:disabled='loading'
									class='elevation-2'
									color='error'
									dark
									large
								>
									<ButtonIcon :icon='mdiClose' />
									cancel
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='1' order-md='3'>
								<v-btn
									@click='updateMeal'
									:class='{"elevation-0": loading || v$.$invalid || completed}'
									:disabled='loading || v$.$invalid || completed'
									:block='smAndDown'
									class='elevation-2'
									color='secondary'
									dark
									large
								>
									<ButtonIcon :icon='mdiDatabaseEdit' />
									UPDATE
								</v-btn>
							</v-col>
						</v-row>
					</div>
				</v-col>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>
import { axios_adminMeal, axios_adminPhoto } from '@/services/axios';
import { convert_date } from '@/vanillaTS/date_convert';
import { dialoger } from '@/services/dialog';
import { env } from '@/vanillaTS/env';
import { FrontEndRoutes } from '@/types/enum_routes';
import { genesisDate } from '@/vanillaTS/globalConst';
import { mdiAttachment, mdiCalendar, mdiClose, mdiDeleteForever, mdiFood, mdiMessageText, mdiRestore, mdiDatabaseEdit } from '@mdi/js';
import { required } from '@vuelidate/validators';
import { snackError, snackSuccess } from '@/services/snack';
import { useDisplay } from 'vuetify';
import type { PV, TAuthObject, TMealDatePerson, TPerson } from '@/types';
import useVuelidate from '@vuelidate/core';
const { smAndDown } = useDisplay();

const router = useRouter();
const route = useRoute();

onBeforeUnmount(async () => {
	adminModule().set_date('');
	adminModule().set_person('');
	if (!completed.value && meal.value.photo_converted && meal.value.photo_original) await clear();

});

/**
** Use params in client url to send request to server for that meals info
*/
onBeforeMount(async () => {
	loading.value = true;
	let person = adminModule().person as TPerson;
	let date = adminModule().date;
	router.replace({ path: route.path, query: { person, date } });
	const validated = await axios_adminMeal.singleMeal_get({ date, person });
	loading.value= false;
	if (validated) {
		original_date.value = validated.date;
		editMealHasPhoto.value = validated.photo_original ? true : false;
		meal.value = validated;
		imageUrl.value = validated.photo_converted ? `${env.domain_static}/converted/${validated.photo_converted}`: '';
		dataReady.value = true;
		const browserStore = browserModule();
		browserStore.set_pageTitle(`Edit meal: ${person} ${date}`);
		browserStore.set_description('Meal Pedant - Edit an existing meal');
	} else {
		snackError({ message: 'Unknown meal' });
		await router.push(FrontEndRoutes.MEALS);
	}
});

/**
** Add suffix to date box label
*/
const computedDateLabel = computed((): string =>{
	if (!meal.value) return '';
	const today_long = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
	const today = today_long.toISOString().slice(0, 10);
	const yesterday = new Date(today_long.setDate(today_long.getDate() - 1)).toISOString().substring(0, 10);
	const text = 'Choose date';
	return meal.value.date === today ? `${text} - today`: meal.value.date === yesterday ? `${text} - yesterday` : text;
});

const categories = computed((): Array<string> => {
	return categoriesModule().sorted_categories_names;
});

/**
** Category name in text field
**/
const computedSuffix = computed((): string => {
	if (!meal.value.category) return '';
	let filteredCategories = '';
	const inputLength = meal.value.category.length;
	const input = meal.value.category.toUpperCase().substring(0, inputLength);
	for (const eachCategory of categories.value) if (eachCategory.substring(0, inputLength) === input) filteredCategories += `${eachCategory} `;
	return filteredCategories;
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

const showDate = ref(false);
const mealDate = ref(undefined as undefined | string);

watch(mealDate, (i) => {
	if (i) {
		meal.value.date = convert_date(String(i));
	}
});
const minDate= new Date(genesisDate).toISOString().slice(0, 10);

const completed = ref(false);
// const converted = ref(false);
const dataReady = ref(false);
const editMealHasPhoto = ref(false);
const imageToUpload = ref([] as File[]);
const imageUrl = ref('');
const meal = ref({
	id: '',
	meal_photo_id: '',
	photo_original: '',
	photo_converted: '',
	date: '',
	category: '',
	description: '',
	restaurant: false,
	takeaway: false,
	vegetarian: false,
	person: '' as TPerson
} as TMealDatePerson);

const mealTypes = [ 'restaurant' as const, 'takeaway' as const, 'vegetarian' as const ];
// const menu = ref(false);
// const original = ref(false);
const original_date = ref('');

// const padding = (i: string): string => {
// 	return String(i).padStart(2, '0');
// };

/**
** Remove any uploaded photos, go back to meals back
*/
const cancel = async (): PV => {
	await clear();
	router.push(FrontEndRoutes.MEALS);
};
/**
** When image removed from file input, send a request to delete file from sever
*/
const clear = async (): PV => {
	loading.value = true;
	if (!meal.value.photo_original || !meal.value.photo_converted) return;
	if (!editMealHasPhoto) {
		axios_adminPhoto.photo_delete({
			original: meal.value.photo_original,
			converted: meal.value.photo_converted
		});
	}
	imageToUpload.value = [];
	imageUrl.value = '';
	meal.value.photo_converted = '';
	meal.value.photo_original = '';
	loading.value = false;
};

const deleteMeal = (): void => {

	dialoger({
		message: 'Are you sure you want to delete the meal?',
		buttonText: 'delete',
		title: 'Delete Meal',
		passwordRequired: true,
		confirmFunction: deleteMeal_confirm
	});
} ;

/**
*Delete meal completely
* @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
*/
const deleteMeal_confirm = async (authObject: TAuthObject): PV => {
	loading.value= true;
	if (!meal.value) return;
	const success = await axios_adminMeal.meal_delete({ person: meal.value.person, date: original_date.value, auth: authObject });
	if (success) {
		snackSuccess({ message: 'Meal deleted', type: 'success', icon: mdiDeleteForever });
		await router.push(FrontEndRoutes.MEALS);
	}
	loading.value= false;
};
/**
** Upload image to db, return {o: file_name, c:file_name}
*/
const fileInserted = async (): PV => {
	loading.value= true;
	if (!imageToUpload.value[0]) {
		clear();
		return;
	}
	if (!imageToUpload.value[0] || !meal.value) return;
				
	// TODO just snack here
	if (imageToUpload.value[0].size > 10240000) {
		snackError({ message: 'File too big' });
		return;
	}
	const suffix = imageToUpload.value[0].type.split('/');
	const fileType = suffix[1]?.toLowerCase();
	if (!fileType) return;

	const acceptable = [ 'jpeg', 'jpg' ];
	if (acceptable.indexOf(fileType) < 0) {
		snackError({ message: 'Invalid filetype' });
		return;
	}
	const data = new FormData();
	const newName = `${meal.value.date}_${meal.value.person.substring(0, 1)}.${fileType}`;
	data.append('image', imageToUpload.value[0], newName);

	const response = await axios_adminPhoto.photo_post(data);
	if (response) {
		[ meal.value.photo_original, meal.value.photo_converted ] = [ response.original, response.converted ];
		imageUrl.value = `${env.domain_static}/converted/${meal.value.photo_converted }`;
	}
	// eslint-disable-next-line require-atomic-updates
	imageToUpload.value = [];
	loading.value= false;
} ;
	
/**
		 ** Remove whitespace from end of category, when input has been blurred
		 */
const trimCategory = (): void => {
	if (meal.value.category) meal.value.category = meal.value.category.trim();
};
const updateMeal = (): void => {

	dialoger({
		message: 'Are you sure you want to update this meal?',
		buttonText: 'update',
		title: 'Update Meal',
		passwordRequired: false,
		timeout: 5,
		confirmFunction: updateMeal_confirm
	});
};
const updateMeal_confirm = async (): PV => {
	if (v$.value.$invalid) return;
	loading.value= true;

	if (!meal.value.photo_original) meal.value.photo_original = undefined;
	if (!meal.value.photo_converted) meal.value.photo_converted = undefined;
	const success = await axios_adminMeal.meal_patch({ meal: meal.value, original_date: original_date.value });
	if (success) {
		const infobarMessage = `${meal.value.date} missing for ${meal.value.person}`;
		infobarModule().remove_message(infobarMessage);
		snackSuccess({ message: 'Meal edited', type: 'success', icon: mdiDatabaseEdit });
		completed.value = true;
		await router.push(FrontEndRoutes.MEALS);
	}
};

const previous = (): void => {
	if (meal.value.date) {
		const d = new Date(meal.value.date);
		d.setDate(d.getDate() -1);
		meal.value.date = d.toISOString().slice(0, 10);
	}
};

const rules = {
	person: {
		required
	},
	category: {
		required
	},
	date: {
		required
	},
	description: {
		required
	},
};
const v$ = useVuelidate(rules, meal);
</script>

<style>
/* TODO put in variables css */
@media (max-width: 960px) {
	.v-input--switch .v-label{
		font-size: 12px;
	}
}

@media (max-width: 600px) {
	.v-input--switch .v-label{
		font-size: 10px;
	}
}
</style>