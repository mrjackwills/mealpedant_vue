<template>
	<v-col cols='12' justify='start' class='mb-0 py-0' :class='computedFont'>
		<span @click='goToEdit' :class='[categoryColor, {"cl":admin}]'> {{ category }}</span>
		<span v-if='restaurant' class='font-weight-bold text-uppercase ml-1 text-mealtype'>r</span>
		<span v-if='takeaway' class='font-weight-bold text-uppercase ml-1 text-mealtype'>t</span>
		<span v-if='vegetarian' class='font-weight-bold text-uppercase ml-1 text-mealtype'>v</span>
	</v-col>
	<v-col cols='12' class='my-0 py-0'>
		<div class='' :class='computedFont'>
			<span class='text-uppercase'>{{ description.slice(0,1) }}</span>
			<span>{{ description.slice(1) }}</span>
		</div>
	</v-col>
	<v-col cols='12' align='self-end' class='' v-if='photo?.o'>
		<v-row class=''>
			<v-col
				@click='showPhoto(photo, date, person)'
				class='cl '
				cols='12'
			>
				<v-row align='center' justify='start' class=''>
					<v-col cols='auto' class='ma-0 py-0'>
						<v-icon class='text-mealtype' style='vertical-align: middle;' size='small' :icon='mdiCamera' />
					</v-col>
					<v-col cols='auto' class='ma-0 py-0'>
						<div class='text-mealtype text-uppercase' :class='computedFont'>view</div>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-col>
</template>

<script setup lang='ts'>
import { mdiCamera } from '@mdi/js';
import type { TPerson, TPhoto, u } from '@/types';

import { useDisplay } from 'vuetify';
import { FrontEndRoutes } from '@/types/const_routes';
const { mdAndDown } = useDisplay();

const admin = computed((): boolean => {
	return userModule().admin;
});
const categoryColor = computed((): string => {
	return props.person === 'D' ? 'text-primary ' : 'text-secondary';
});
const computedFont = computed((): string => {
	return mdAndDown ? '' : 'text-body-1';
});
const photoDate = computed({
	get (): u<string> {
		return foodModule().photo_date;
	},
	set (s: u<string>): void {
		foodModule().set_photo_date(s);
	}
});
const photoPerson = computed({
	get (): u<TPerson> {
		return foodModule().photo_person;
	},
	set (s: u<TPerson>): void {
		foodModule().set_photo_person(s);
	}
});
const photoUrlConverted = computed({
	get (): u<string> {
		return foodModule().photo_url_converted;
	},
	set (s: u<string>): void {
		foodModule().set_photo_url_converted(s);
	}
});
const photoUrlOriginal = computed({
	get (): u<string> {
		return foodModule().photo_url_original;
	},
	set (s: u<string>): void {
		foodModule().set_photo_url_original(s);
	}
});

const router = useRouter();

const goToEdit = (): void => {
	if (admin.value) {

		const person = props.person === 'D' ? 'Dave' : 'Jack';
		adminModule().set_person(person);
		adminModule().set_date(props.date);
		router.push(FrontEndRoutes.EDITMEAL);
	}
};

const showPhoto = (i: TPhoto, d: string, p: string): void => {
	foodModule().set_dialog(true);
	photoDate.value = d;
	photoPerson.value = p === 'D' ? 'Dave' : 'Jack';
	photoUrlConverted.value = `/converted/${i.c}`;
	photoUrlOriginal.value = `/original/${i.o}`;
};

const props = withDefaults(defineProps<{
	category: string;
	date: string;
	description: string;
	person: string;
	photo?: TPhoto;
	restaurant?: boolean;
	takeaway?: boolean;
	vegetarian?: boolean;
}>(), {
	restaurant: false,
	takeaway: false,
	vegetarian: false,
	photo: undefined

});

</script>