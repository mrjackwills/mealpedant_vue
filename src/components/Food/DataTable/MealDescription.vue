<template>
	<v-container container--fluid class='pa-0' >
		<v-row justify='center' class='no-gutters'>
			<v-col cols='12' class='pa-0'>
				<v-row class='no-gutters'>
					<v-col cols='12' justify='start' class='pa-0' :class='computedFont'>
						<router-link :to='routerLink' v-if='admin' :class='categoryColor'> {{ category }}</router-link>
						<span v-else :class='categoryColor'> {{ category }}</span>

						<span v-if='restaurant' class='font-weight-bold text-uppercase ml-1 mealtype--text'>r</span>
						<span v-if='takeaway' class='font-weight-bold text-uppercase ml-1 mealtype--text'>t</span>
						<span v-if='vegetarian' class='font-weight-bold text-uppercase ml-1 mealtype--text'>v</span>
					</v-col>
					<v-col cols='12' class='pa-0'>
						<div class='' :class='computedFont'>
							<span class='text-uppercase'>{{ description.slice(0,1) }}</span>
							<span>{{ description.slice(1) }}</span>
						</div>
					</v-col>
				</v-row>
			</v-col>
			<v-col cols='12' class='pa-0'>
				<v-spacer />
			</v-col>
			<v-col cols='12' align='self-end' class='pa-0'>
				<v-row v-if='photo.o' class='no-gutters'>
					<v-col
						@click='showPhoto(photo, date, person)'
						class='cl mt-2 mb-1 py-0'
						cols='12'
						shrink
					>
						<v-row align='center' justify='start' class='no-gutters'>
							<v-col cols='auto'>
								<v-icon class='mr-1 mealtype--text' style='vertical-align: middle;' small>
									{{ mdiCamera }}
								</v-icon>
							</v-col>
							<v-col cols='auto'>
								<div class='mealtype--text text-uppercase' :class='computedFont'>view</div>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang='ts'>
import { foodModule, userModule } from '@/store';
import { mdiCamera } from '@mdi/js';
import { TPerson, TPhoto, u } from '@/types';
import Vue from 'vue';

export default Vue.extend({
	name: 'person-column',

	computed: {
		admin (): boolean {
			return userModule().admin;
		},
		categoryColor (): string {
			return this.person === 'D' ? 'primary--text ' : 'secondary--text';
		},
		computedFont (): string {
			return this.$vuetify.breakpoint.mdAndDown ? 'smalltext': 'text-body-1';
		},
		photoDate: {
			get: function (): u<string> {
				return foodModule().photo_date;
			},
			set: function (s: string): void {
				foodModule().set_photo_date(s);
			}
		},
		photoPerson: {
			get: function (): u<TPerson> {
				return foodModule().photo_person;
			},
			set: function (s: TPerson): void {
				foodModule().set_photo_person(s);
			}
		},
		photoUrlConverted: {
			get: function (): u<string> {
				return foodModule().photo_url_converted;
			},
			set: function (s: string): void {
				foodModule().set_photo_url_converted(s);
			}
		},
		photoUrlOriginal: {
			get: function (): u<string> {
				return foodModule().photo_url_original;
			},
			set: function (s: string): void {
				foodModule().set_photo_url_original(s);
			}
		},
		routerLink (): string {
			const person = this.person === 'D'? 'Dave': 'Jack';
			return `/editmeal?d=${this.date}&p=${person}`;
		}
	},

	data: () => ({
		mdiCamera,
	}),

	methods: {
		// Show the photo dialog
		showPhoto (i: TPhoto, d: string, p: string): void {
			foodModule().set_dialog(true);
			this.photoDate = d;
			this.photoPerson = p === 'D' ? 'Dave': 'Jack';
			this.photoUrlConverted = `/converted/${i.c}`;
			this.photoUrlOriginal = `/original/${i.o}`;
		},
	},
	props: {
		category: {
			type: String,
			required: true
		},
		date: {
			type: String,
			required: true
		},
		description: {
			type: String,
			required: true
		},
		person: {
			type: String,
			required: true
		},
		photo: {
			type: Object,
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			default: (): void => {}
		},
		restaurant: {
			type: Boolean,
			default: false
		},
		takeaway: {
			type: Boolean,
			default: false
		},
		vegetarian: {
			type: Boolean,
			default: false
		},
	}
});
</script>