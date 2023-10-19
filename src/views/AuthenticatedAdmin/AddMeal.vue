<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' class='no-gutters'>
			<v-col class='pa-0' cols='12' sm='8' md='6'>
				<v-form v-on:submit.prevent >
					<v-col class='pa-0' cols='12'>

						<v-text-field
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
									:min='minDate'
								/>
							</v-menu>
						</v-text-field>
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
							v-model.trim='meal.category'
							@blur='trimCategory'
							:disabled='completed'
							:prepend-icon='mdiFood'
							:suffix='computedSuffix'
							label='CATEGORY'
							variant='underlined'
							name='category'
							type='text'
						/>
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
						accept='image/jpeg,image/jpg'
						label='SELECT IMAGE'
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
							<v-col cols='12' md='auto' order='1' order-md='2'>
								<v-btn
									@click='addMeal'
									:block='smAndDown'
									:color='loading || v$.$invalid || completed?"":"secondary"'
									:disabled='loading || v$.$invalid || completed'
									:variant='loading || v$.$invalid || completed?"outlined":"flat"'
									size='large'
								>
									<ButtonIcon :icon='mdiCloudUpload' />
									ADD MEAL
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='2' order-md='1'>
								<v-btn
									@click='cancel'
									:block='smAndDown'
									:class='{"mt-4" : smAndDown }'
									:disabled='loading'
									:variant='loading?"outlined":"flat"'
									color='error'
									size='large'
								>
									<ButtonIcon :icon='mdiClose' />
									cancel
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
import { VDatePicker } from 'vuetify/labs/VDatePicker';
import { env } from '@/vanillaTS/env';
import { mdiAttachment, mdiCalendar, mdiClose, mdiCloudUpload, mdiFood, mdiMessageText, mdiPlusCircle, mdiRestore } from '@mdi/js';
import type { PV, TPerson } from '@/types';
import { snackSuccess } from '@/services/snack';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { FrontEndRoutes } from '@/types/enum_routes';
import { genesisDate } from '@/vanillaTS/globalConst';
import { convert_date } from '@/vanillaTS/date_convert';
import { useDisplay } from 'vuetify';
const { smAndDown } = useDisplay();

const router = useRouter();

onBeforeUnmount(async ()=> {
	if (!completed.value && meal.value.photo_converted && meal.value.photo_original) await clear();
});

const categories = computed((): Array<string> => {
	return categoriesModule().sorted_categories_names;
});
/**
 ** Add suffix to date box label
 */
const computedDateLabel = computed((): string => {
	const today_long = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
	const today = today_long.toISOString().slice(0, 10);
	const yesterday = new Date(today_long.setDate(today_long.getDate() - 1)).toISOString().substring(0, 10);
	const text = 'Choose date';
	return meal.value.date === today ? `${text} - today`: meal.value.date === yesterday ? `${text} - yesterday` : text;
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

onMounted(() => {
	browserModule().set_pageTitle('Add Meal');
	browserModule().set_description('Meal Pedant - Add a new meal');
});

const mealDate = ref([]);

const mealTypes = [ 'restaurant' as const, 'takeaway' as const, 'vegetarian' as const ];
const completed = ref(false);
const imageToUpload = ref([] as File[]);
const imageUrl = ref('');
const showDate = ref(false);
const meal = ref({
	category: '',
	date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
	description: '',
	person: '' as TPerson,
	photo_converted: undefined as undefined|string,
	photo_original: undefined as undefined|string,
	restaurant: false,
	takeaway: false,
	vegetarian: false,
});

watch(mealDate, (i) => {
	if (i) {
		meal.value.date = convert_date(String(i));
	}
});

const minDate= new Date(genesisDate).toISOString().slice(0, 10);

/**
** Add new meal to db
**/
const addMeal = async (): PV => {
	if (v$.value.$invalid) return;
	loading.value = true;
	const infobarMessage = `${meal.value.date} missing for ${meal.value.person}`;
	const response = await axios_adminMeal.meal_post(meal.value);
	if (response) {
		infobarModule().remove_message(infobarMessage);
		snackSuccess({ message: 'New meal added', type: 'success', icon: mdiPlusCircle });
		completed.value = true;
		await router.push(FrontEndRoutes.MEALS);
	}
	loading.value = false;
};

/**
 ** Remove any uplaoded photos, go back to meals back
 */
const cancel = async (): PV => {
	await clear();
	await router.push(FrontEndRoutes.MEALS);
} ;

/**
	 ** When image removed from file input, send a request to delete file from sever
	 */
const clear = async (): PV => {
	loading.value= true;
	if (!meal.value.photo_original || !meal.value.photo_converted) {
		loading.value= false;
		return;
	}
	const success = await axios_adminPhoto.photo_delete({
		original: meal.value.photo_original,
		converted: meal.value.photo_converted
	});
	if (success) {
		imageToUpload.value = [];
		imageUrl.value = '';
		// eslint-disable-next-line require-atomic-updates
		meal.value.photo_converted = '';
		// eslint-disable-next-line require-atomic-updates
		meal.value.photo_original = '';
	}
	loading.value= false;
};
/**
 ** Upload image to db, return {o: file_name, c:file_name}
 */
const fileInserted = async (): PV => {
	loading.value= true;
	if (!imageToUpload.value) return clear();
	if (imageToUpload.value === undefined) return;
	if (imageToUpload.value[0].size > 10240000) throw { message: 'file too big', status: 400 };
	const suffix = imageToUpload.value[0].type.split('/');
	const fileType = suffix[1]?.toLowerCase();
	if (!fileType) return;
	const acceptable = [ 'jpeg', 'jpg' ];
	if (acceptable.indexOf(fileType) < 0) throw { message: 'JPEGs only', status: 400 };
	const data = new FormData();
	const newName = `${meal.value.date}_${meal.value.person.substring(0, 1)}.${fileType}`;
	data.append('image', imageToUpload.value[0], newName);
	const response = await axios_adminPhoto.photo_post(data);
	loading.value= false;
	if (response) {
		[ meal.value.photo_original, meal.value.photo_converted ] = [ response.original, response.converted ];
		imageUrl.value = `${env.domain_static}/converted/${meal.value.photo_converted }`;
	}
};
/**
 ** Remove whitespace from end of category, when input has been blurred
 */
const trimCategory = (): void => {
	if (meal.value.category) meal.value.category = meal.value.category.trim();
};
/**
 ** Change meal.value.date to yesterdays date
 */
const yesterday = (): void => {
	const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
	today.setDate(today.getDate() -1);
	meal.value.date = today.toISOString().slice(0, 10);
};
// },

const rules ={
	category: {
		required
	},
	date: {
		required
	},
	description: {
		required
	},
	person: {
		required
	},
};
const v$ = useVuelidate(rules, meal);

</script>

<style>
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