<template>
	<v-container container--fluid fill-height>
		<v-row align='center' justify='center' class='no-gutters'>
			<v-col class='pa-0' cols='12' sm='8' md='6'>
				<v-form v-on:submit.prevent >
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
							v-model='menu'
							:close-on-content-click='false'
							:nudge-right='40'
							activator='#start-date'
							min-width='290px'
							ref='menu'
							transition='scale-transition'
							offset-y
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
							v-model.trim='meal.category'
							@blur='trimCategory'
							:disabled='completed'
							:prepend-icon='mdiFood'
							:suffix='computedSuffix'
							label='CATEGORY'
							name='category'
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
									max-height='15vh'
									max-width='15vw'
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
						accept='image/jpeg,image/jpg'
						label='SELECT IMAGE'
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
							<v-col cols='12' md='auto' order='1' order-md='2'>
								<v-btn
									@click='addMeal'
									:block='$vuetify.breakpoint.smAndDown'
									:class='{"elevation-0": loading || $v.$invalid || completed}'
									:disabled='loading || $v.$invalid || completed'
									class='elevation-2'
									color='secondary'
									dark
									large
								>
									<app-button-icon :icon='mdiCloudUpload' />
									ADD MEAL
								</v-btn>
							</v-col>
							<v-col cols='12' md='auto' order='2' order-md='1'>
								<v-btn
									@click='cancel'
									:block='$vuetify.breakpoint.smAndDown'
									:class='{"elevation-0": loading, "mt-8" : $vuetify.breakpoint.smAndDown }'
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
						</v-row>
					</div>
				</v-col>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { axios_adminMeal, axios_adminPhoto } from '@/services/axios';
import { categoriesModule, infobarModule, loadingModule } from '@/store';
import { env } from '@/vanillaTS/env';
import { mdiAttachment, mdiCalendar, mdiClose, mdiCloudUpload, mdiFood, mdiMessageText, mdiPlusCircle, mdiRestore } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { PV, TPerson, u } from '@/types';
import { required } from 'vuelidate/lib/validators';
import { snackSuccess } from '@/services/snack';
import ButtonIcon from '@/components/ButtonIcon.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'add-meal-page',

	async beforeDestroy () {
		if (!this.completed && this.meal.photo_converted && this.meal.photo_original) await this.clear();
	},

	components: {
		appButtonIcon: ButtonIcon,
	},

	computed: {
		categories (): Array<string> {
			return categoriesModule().sorted_categories_names;
		},
		/**
		 ** Add suffix to date box label
		 */
		computedDateLabel (): string {
			const today_long = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
			const today = today_long.toISOString().slice(0, 10);
			const yesterday = new Date(today_long.setDate(today_long.getDate() - 1)).toISOString().substring(0, 10);
			const text = 'Choose date';
			return this.meal.date === today ? `${text} - today`: this.meal.date === yesterday ? `${text} - yesterday` : text;
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
		mealTypes: [ 'restaurant' as const, 'takeaway' as const, 'vegetarian' as const ],
		completed: false,
		imageToUpload: undefined as u<File>,
		imageUrl: '',
		mdiAttachment,
		mdiCalendar,
		mdiClose,
		mdiCloudUpload,
		mdiFood,
		mdiMessageText,
		mdiPlusCircle,
		mdiRestore,
		menu: false,
		meal: {
			category: '',
			date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
			description: '',
			person: '' as TPerson,
			photo_converted: undefined as undefined|string,
			photo_original: undefined as undefined|string,
			restaurant: false,
			takeaway: false,
			vegetarian: false,
		},
		pageTitle: 'Add Meal',
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	methods: {
		/**
		** Add new meal to db
		**/
		async addMeal (): PV {
			if (this.$v.$invalid) return;
			this.loading = true;
			const infobarMessage = `${this.meal.date} missing for ${this.meal.person}`;
			const response = await axios_adminMeal.meal_post(this.meal);
			if (response) {
				infobarModule().remove_message(infobarMessage);
				snackSuccess({ message: 'New meal added', type: 'success', icon: mdiPlusCircle });
				this.completed = true;
				await this.$router.push('/meals');
			}
			this.loading = false;
		},
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
			if (!this.meal.photo_original || !this.meal.photo_converted) {
				this.loading = false;
				return;
			}
			const success = await axios_adminPhoto.photo_delete({
				original: this.meal.photo_original,
				converted: this.meal.photo_converted
			});
			if (success) {
				this.imageToUpload = undefined;
				this.imageUrl = '';
				this.meal.photo_converted = '';
				this.meal.photo_original = '';
			}
			this.loading = false;
		},
		/**
		** Upload image to db, return {o: file_name, c:file_name}
		*/
		async fileInserted (): PV {
			this.loading = true;
			if (!this.imageToUpload) return this.clear();
			if (this.imageToUpload === undefined) return;
			if (this.imageToUpload.size > 10240000) throw { message: 'file too big', status: 400 };
			const suffix = this.imageToUpload.type.split('/');
			const fileType = suffix[1]?.toLowerCase();
			if (!fileType) return;
			const acceptable = [ 'jpeg', 'jpg' ];
			if (acceptable.indexOf(fileType) < 0) throw { message: 'JPEGs only', status: 400 };
			const data = new FormData();
			const newName = `${this.meal.date}_${this.meal.person.substring(0, 1)}.${fileType}`;
			data.append('image', this.imageToUpload, newName);
			const response = await axios_adminPhoto.photo_post(data);
			this.loading = false;
			if (response) {
				[ this.meal.photo_original, this.meal.photo_converted ] = [ response.original, response.converted ];
				this.imageUrl = `${env.domain_static}/converted/${this.meal.photo_converted }`;
			}
		},
		/**
		 ** Remove whitespace from end of category, when input has been blurred
		 */
		trimCategory (): void {
			if (this.meal.category) this.meal.category = this.meal.category.trim();
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

	validations: {
		meal: {
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
		}
	},
});
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