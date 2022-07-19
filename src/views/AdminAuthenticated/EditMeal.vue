<template>
	<v-container container--fluid fill-height v-if='dataReady && meal'>
		<v-row align='center' justify='center' class='no-gutters'>
			<v-col class='pa-0' cols='12' sm='8' md='6'>
				<v-form
					v-on:submit.prevent>
					<v-col class='pa-0' cols='12'>
						<v-text-field
							v-model='meal.date'
							@click:append-outer='yesterday'
							:append-outer-icon='mdiRestore'
							:label='computedDateLabel'
							:prepend-icon='mdiCalendar'
							id='start-date'
							readonly
						>
						</v-text-field>

						<v-menu
							ref='menu'
							activator='#start-date'
							:close-on-content-click='false'
							transition='scale-transition'
							v-model='menu'
							:nudge-right='40'
							offset-y
							min-width='290px'
						>
							<v-date-picker
								v-model='meal.date'
								@input='menu = false'
								first-day-of-week='1'
								min='2015-05-09'
							>
							</v-date-picker>
						</v-menu>

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
							name='description'
							rows='3'
						/>
					</v-col>
				</v-form>
				<v-expand-transition>
					<v-col cols='12' class='pa-0'>
						<v-row v-if='imageUrl' justify='center' align='center' class='no-gutters'>
							<v-col class='pa-0' cols='auto'>
								<v-img
									:src='imageUrl'
									alt='A photograph of a meal'
									max-height='35vh'
									max-width='35vw'
									contain
								>
								</v-img>
							</v-col>
						</v-row>
					</v-col>
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
					>
					</v-file-input>
					<v-text-field
						v-else
						v-model='meal.photo_original'
						@click:append-outer='clear'
						:append-outer-icon='meal.photo_original ? mdiClose: ""'
						:prepend-icon='mdiAttachment'
					>
					</v-text-field>
				</v-col>
				<v-col class='pa-0' cols='12' v-if='!completed'>
					<div class='text-center mt-3'>
						<v-row align='center' justify='space-around' class='no-gutters'>
							<v-col cols='12' md='auto' order='3' order-md='1'>
								<v-btn
									@click='deleteMeal'
									:block='$vuetify.breakpoint.smAndDown'
									:class='{"elevation-0": loading || $v.$invalid, "mt-8" : $vuetify.breakpoint.smAndDown }'
									:disabled='loading || $v.$invalid'
									class='elevation-2 black--text'
									color='primary'
									large
								>
									<app-button-icon color='black' :icon='mdiDeleteForever' />
									delete
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='2'>
								<v-btn
									@click='cancel'
									:class='{"elevation-0": loading, "mt-8" : $vuetify.breakpoint.smAndDown }'
									:block='$vuetify.breakpoint.smAndDown'
									:disabled='loading'
									class='elevation-2'
									color='error'
									dark
									large
								>
									<app-button-icon :icon='mdiClose' />
									cancel
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='1' order-md='3'>
								<v-btn
									@click='updateMeal'
									:class='{"elevation-0": loading || $v.$invalid || completed}'
									:disabled='loading || $v.$invalid || completed'
									:block='$vuetify.breakpoint.smAndDown'
									class='elevation-2'
									color='secondary'
									dark
									large
								>
									<app-button-icon :icon='mdiDatabaseEdit' />
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

<script lang='ts'>
import { axios_adminMeal, axios_adminPhoto } from '@/services/axios';
import { dialoger } from '@/services/dialog';
import { env } from '@/vanillaTS/env';
import { loadingModule, categoriesModule, infobarModule } from '@/store';
import { mdiAttachment, mdiCalendar, mdiClose, mdiDeleteForever, mdiFood, mdiMessageText, mdiRestore, mdiDatabaseEdit } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { PV, TAuthObject, TMealDatePerson, TPerson, u } from '@/types';
import { required } from 'vuelidate/lib/validators';
import { snackError, snackSuccess } from '@/services/snack';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({

	name: 'edit-meal-page',

	components: {
		appButtonIcon: ButtonIcon,
	},

	async beforeDestroy () {
		if (!this.completed && this.meal?.photo_converted && this.meal?.photo_original) await this.clear();
	},
	/**
	 ** Use params in client url to send request to server for that meals info
	 */
	async beforeMount () {
		this.loading = true;
		const validated = await axios_adminMeal.singleMeal_get({ date: this.$route.query.d as string, person: this.$route?.query?.p as TPerson });
		this.loading = false;
		if (validated) {
			this.original_date = validated.date;
			this.editMealHasPhoto = validated.photo_original ? true : false;
			this.meal = validated;
			this.imageUrl = validated.photo_converted ? `${env.domain_static}/converted/${validated.photo_converted}`: '';
			this.dataReady = true;
		} else {
			snackError({ message: 'Unknown meal' });
			this.$router.push('/meals');
		}
	},

	computed: {
		/**
		 ** Add suffix to date box label
		 */
		computedDateLabel (): string {
			if (!this.meal) return '';
			const today_long = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
			const today = today_long.toISOString().slice(0, 10);
			const yesterday = new Date(today_long.setDate(today_long.getDate() - 1)).toISOString().substring(0, 10);
			const text = 'Choose date';
			return this.meal.date === today ? `${text} - today`: this.meal.date === yesterday ? `${text} - yesterday` : text;
		},

		categories (): Array<string> {
			return categoriesModule().sorted_categories_names;
		},
		/**
		 ** Category name in text field
		 **/
		computedSuffix (): string {
			if (!this.meal.category) return '';
			let filteredCategories = '';
			const inputLength = this.meal.category.length;
			const input = this.meal.category.toUpperCase().substring(0, inputLength);
			for (const eachCategory of this.categories) if (eachCategory.substring(0, inputLength) === input) filteredCategories += `${eachCategory} `;
			return filteredCategories;
		},

		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},

	},
	data: () => ({
		completed: false,
		converted: false,
		dataReady: false,
		editMealHasPhoto: false,
		imageToUpload: undefined as u<File>,
		imageUrl: '',
		mdiAttachment,
		mdiCalendar,
		mdiClose,
		mdiDatabaseEdit,
		mdiDeleteForever,
		mdiFood,
		mdiMessageText,
		mdiRestore,
		meal: {
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
		} as TMealDatePerson,
		mealTypes: [ 'restaurant' as const, 'takeaway' as const, 'vegetarian' as const ],
		menu: false,
		original: false,
		original_date: '',
		pageTitle: 'Edit Meal',
	}),

	filters: {
		/**
		 ** Return 0 padded string, for countdown timers
		 * @param {string} i Ideally a string of numbers
		 */
		padding (i: string): string {
			return String(i).padStart(2, '0');
		}
	},
	methods: {

		/**
		 ** Remove any uplaoded photos, go back to meals back
		 */
		async cancel (): PV {
			await this.clear();
			await this.$router.push(`/meals`);
		},
		/**
		 ** When image removed from file input, send a request to delete file from sever
		 */
		async clear (): PV {
			this.loading = true;
			if (!this.meal?.photo_original || !this.meal.photo_converted) return;
			if (!this.editMealHasPhoto) {
				axios_adminPhoto.photo_delete({
					o: this.meal.photo_original,
					c: this.meal.photo_converted
				});
			}
			this.imageToUpload = undefined;
			this.imageUrl = '';
			this.meal.photo_converted = '';
			this.meal.photo_original = '';
			this.loading = false;
		},
		deleteMeal (): void {

			dialoger({
				message: 'Are you sure you want to delete the meal?',
				buttonText: 'delete',
				title: 'Delete Meal',
				passwordRequired: true,
				confirmFunction: this.deleteMeal_confirm
			});

		},
		/**
		 *Delete meal completely
		  * @param {Object} AuthObject - {password: string, token?:string, twoFABackup?:boolean}
		 */
		async deleteMeal_confirm (authObject: TAuthObject): PV {
			this.loading = true;
			if (!this.meal) return;
			const success = await axios_adminMeal.meal_delete({ person: this.meal.person, date: this.original_date, auth: authObject });
			if (success) {
				snackSuccess({ message: 'Meal deleted', type: 'success', icon: mdiDeleteForever });
				await this.$router.push('/meals');
			}
			this.loading = false;
		},
		/**
		** Upload image to db, return {o: file_name, c:file_name}
		*/
		async fileInserted (): PV {
			this.loading = true;
			if (!this.imageToUpload) {
				this.clear();
				return;
			}
			if (!this.imageToUpload || !this.meal) return;
				
			// TODO just snack here
			if (this.imageToUpload?.size > 10240000) {
				snackError({ message: 'File too big' });
				return;
			}
			const suffix = this.imageToUpload.type.split('/');
			const fileType = suffix[1]?.toLowerCase();
			if (!fileType) return;

			const acceptable = [ 'jpeg', 'jpg' ];
			if (acceptable.indexOf(fileType) < 0) {
				snackError({ message: 'Invalid filetype' });
				return;
			}
			const data = new FormData();
			const newName = `${this.meal.date}_${this.meal.person.substring(0, 1)}.${fileType}`;
			data.append('image', this.imageToUpload, newName);

			const response = await axios_adminPhoto.photo_post(data);
			if (response) {
				[ this.meal.photo_original, this.meal.photo_converted ] = [ response.original, response.converted ];
				this.imageUrl = `${env.domain_static}/converted/${this.meal.photo_converted }`;
			}
			this.imageToUpload = undefined;
			this.loading = false;
		},
	
		/**
		 ** Remove whitespace from end of category, when input has been blurred
		 */
		trimCategory (): void {
			if (this.meal.category) this.meal.category = this.meal.category.trim();
		},
		updateMeal (): void {

			dialoger({
				message: 'Are you sure you want to update this meal?',
				buttonText: 'update',
				title: 'Update Meal',
				passwordRequired: false,
				timeout: 5,
				confirmFunction: this.updateMeal_confirm
			});
		},
		async updateMeal_confirm (): PV {
			if (this.$v.$invalid) return;
			this.loading = true;

			if (!this.meal.photo_original) this.meal.photo_original = null;
			if (!this.meal.photo_converted) this.meal.photo_converted = null;
			const success = await axios_adminMeal.meal_patch({ meal: this.meal, original_date: this.original_date });
			if (success) {
				const infobarMessage = `${this.meal.date} missing for ${this.meal.person}`;
				infobarModule().remove_message(infobarMessage);
				snackSuccess({ message: 'Meal edited', type: 'success', icon: mdiDatabaseEdit });
				this.completed = true;
				await this.$router.push('/meals');
			}
		},
		/**
		 ** Change this.meal.date to yesterdays date
		 */
		yesterday (): void {
			const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
			today.setDate(today.getDate() -1);
			this.meal.date = today.toISOString().slice(0, 10);
		}
	},

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	validations: {
		meal: {
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
		}
	},

});
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