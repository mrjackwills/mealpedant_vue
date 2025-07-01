<template>
	<v-col cols='12' justify='start' class='ma-0 pa-0' :class='computedFont' >
		<router-link v-if='admin' :to='editHref' :class='[categoryColor, { "cl": admin }]'> {{ formatCategoryName(category) }}</router-link>
		<span v-else :class='categoryColor'>{{ formatCategoryName(category) }}</span>
		<span v-if='restaurant' v-tooltip:top='"Restaurant"'
			class='font-weight-bold text-uppercase ml-1 text-mealtype'>r</span>
		<span v-if='takeaway' v-tooltip:top='"Takeaway"'
			class='font-weight-bold text-uppercase ml-1 text-mealtype'>t</span>
		<span v-if='vegetarian' v-tooltip:top='"Vegetarian"'
			class='font-weight-bold text-uppercase ml-1 text-mealtype'>v</span>
	</v-col>
	<v-col cols='12' class='ma-0 pa-0' :class='computedFont'>
		{{ formatDescription(description) }}
	</v-col>
	<v-col cols='12' class='ma-0 pa-0' align='self-end' v-if='photo?.converted'>
		<v-chip @click='showPhoto' density='compact' variant='flat' color='mealtype' class='ma-0 pa-0 mt-1 mb-2 px-2' size='small' >
			<v-row align='center' justify='center' class='ma-0 pa-0'>
				<v-col cols='auto' class='ma-0 pa-0 mr-1'>
					<v-icon color='black' style='vertical-align: middle;' :size='smAndDown?"x-small":"small"'
						:icon='mdiCamera' />
				</v-col>
				<v-col cols='auto' class='ma-0 pa-0 text-black text-caption' :class='computedFont'>
					view
				</v-col>
			</v-row>
		</v-chip>
	</v-col>
</template>

<script setup lang='ts'>
import { mdiCamera } from '@mdi/js';
import type { PersonPhoto, TPerson } from '@/types';
import { useDisplay } from 'vuetify';
import { FrontEndRoutes } from '@/types/const_routes';
const { mdAndDown, smAndDown } = useDisplay();
import { formatCategoryName } from '@/vanillaTS/helpers';

const admin = computed(() => userModule().admin);
const category = computed(() => mealModule().get_category_by_id(props.meal_category_id));
const categoryColor = computed(() => props.person === 'Dave' ? 'text-primary ' : 'text-secondary');
const computedFont = computed(() => mdAndDown ? '' : 'text-body-1');
const description = computed(() => mealModule().get_description_by_id(props.meal_description_id));
const formatDescription = (description: string): string => `${description.slice(0, 1).toUpperCase()}${description.slice(1)}`;
const mealViewStore = mealViewModule();

const editHref = computed(() => {
	return `${FrontEndRoutes.EDITMEAL}?person=${props.person}&date=${props.date}`;
});

const showPhoto = (): void => {
	if (props.photo?.converted) mealViewStore.set_dialog_photo_url_converted(props.photo.converted);
	if (props.photo?.original) mealViewStore.set_dialog_photo_url_original(props.photo.original);
	mealViewStore.set_photo_date(props.date);
	mealViewStore.set_dialog_photo_person(props.person);
	mealViewStore.set_dialog_photo_meal_description(description.value);
	mealViewStore.set_dialog_visible(true);
};

const props = withDefaults(defineProps<{
	meal_category_id: number;
	date: string;
	meal_description_id: number;
	person: TPerson;
	photo?: PersonPhoto;
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
