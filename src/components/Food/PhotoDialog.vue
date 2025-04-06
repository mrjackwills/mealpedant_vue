<template>
	<v-dialog v-model='dialog' :max-width='maxWidth' eager scroll-strategy='none'>
		<v-card v-intersect='onIntersect'>
			<v-img
				v-if='photoUrlConverted' 
				:src='imgSource'
				:max-height='window_height_70'
				alt='A photograph of a meal'
				class='grey darken-4'
				lazy-src='@/assets/tile_svg.svg'
				eager
			/>
			<v-card-actions>

				<v-container fluid class='ma-0 pa-0'>
					<v-row justify='space-around' align='center' class='no-gutters ma-0 pa-0 mx-2'>

						<v-col cols='1' class='pa-0 ma-0'>
							<v-chip v-if='authenticated' @click='downloadOriginalFromStatic' color='mealtype' class='' align='center' variant='flat' density='compact' size='small'>
								<v-icon class='rotated' style='vertical-align: middle' size='small' :icon='mdiPublish' />
							</v-chip>
						</v-col>

						<v-col cols='10' class='ma-0 pa-0 text-body-2 text-center'>
							<span class='text-red-lighten-4 mr-1'>{{ photoDate }}</span>
							<span class='text-uppercase'>{{ mealDescription.slice(0, 1) }}</span>
							<span>{{ mealDescription.slice(1) }}</span>
						</v-col>

						<v-col cols='1' class='pa-0 ma-0 text-right' align='center'>
							<v-chip @click.stop='closeDialog' color='error' class='' align='center' variant='flat' density='compact' size='small'>
								<v-icon class='ma-0 pa-0' size='small' :icon='mdiClose' />
							</v-chip>
						</v-col>

					</v-row>
				</v-container>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang='ts'>
import { axios_downloadPhoto } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { mdiPublish, mdiClose } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { mdAndUp } = useDisplay();

const mealViewStore = mealViewModule();
const dialog = computed({
	get (): boolean {
		return mealViewStore.dialog_visible;
	},
	set (b: boolean): void {
		mealViewStore.set_dialog_visible(b);
	}
});

const authenticated = computed(() => userModule().authenticated);
const imgSource = computed(() => env.gen_photo_url(photoUrlConverted.value));
const maxWidth = computed(() => mdAndUp.value ? '60vw' : '100vw');
const photoDate = computed(() => mealViewStore.dialog_photo_date);
const photoPerson = computed(() => mealViewStore.dialog_photo_person);
const mealDescription = computed(() => mealViewStore.dialog_meal_description);
const photoUrlConverted = computed(() => mealViewStore.dialog_photo_url_converted);
const photoUrlOriginal = computed(() => mealViewStore.dialog_photo_url_original);
const window_height_70 = computed(() => window.innerHeight * .7);

const closeDialog = (): void => {
	dialog.value = false;
};

/// Download the original photo, by adding it to the page as a link and clicking said link
const downloadOriginalFromStatic = async (): Promise<void> => {
	if (!photoUrlOriginal.value || !authenticated) return;
	const image = await axios_downloadPhoto.photo_get(`photo/${photoUrlOriginal.value}`);
	if (image) {
		const url = window.URL.createObjectURL(new Blob([image]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `${photoPerson.value}-${photoDate.value}.jpg`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
};

const isIntersecting = ref(false);

/// Calculate if visible, and save into isIntersecting
const onIntersect = (is_i: boolean, _entries: Array<IntersectionObserverEntry>, _observer: IntersectionObserver): void => {
	isIntersecting.value = is_i;
};

watch(isIntersecting, (i) => {
	if (!i) {
		window.setTimeout(() => mealViewStore.clear_photo(), 100);
		dialog.value = false;
	}
});

</script>

<style >
.rotated {
	transform: rotate(180deg);
}
</style>