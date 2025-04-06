<template>
	<v-container fluid class='fill-height' v-if='init'>
		<v-row class='ma-0 pa-0' justify='space-around'>
			<v-col cols='12' class='ma-0 pa-0text-center'>
				<v-row class='ma-0 pa-0 bg-black' justify='space-around'>
					<v-col cols='12'  class='ma-0 pa-0 bg-black'>

						<v-row justify='space-around' class='ma-0 pa-0'>
							<v-col cols='auto' class='ma-0 pa-0 text-right'>
								<span class='text-primary mr-1'>original:</span>
								<span class='text-white mr-1'> {{ bytes_to_mb(totalDave[0]) }}mb</span>
							</v-col>
							<v-col cols='auto' class='ma-0 pa-0 text-center'>
								<span class='text-primary mr-1 '>converted:</span>
								<span class='text-white mr-1'>{{ bytes_to_mb(totalDave[1]) }}mb</span>
							</v-col>
							<v-col cols='auto' class='ma-0 pa-0'>
								<span class='text-primary mr-1'>#</span>
								<span class='text-white mr-1'>{{ (totalDave[2]) }}</span>
							</v-col>
						</v-row>

						<v-row justify='space-around' class='ma-0 pa-0'>
							<v-col cols='auto' class='ma-0 pa-0 text-right'>
								<span class='text-secondary mr-1'>original:</span>
								<span class='text-white mr-1'> {{ bytes_to_mb(totalJack[0]) }}mb</span>
							</v-col>
							<v-col cols='auto' class='ma-0 pa-0 text-center'>
								<span class='text-secondary mr-1'>converted:</span>
								<span class='text-white mr-1'>{{ bytes_to_mb(totalJack[1]) }}mb</span>
							</v-col>
							<v-col cols='auto' class='ma-0 pa-0'>
								<span class='text-secondary mr-1'>#</span>
								<span class='text-white mr-1'>{{ (totalJack[2]) }}</span>
							</v-col>
						</v-row>

						<v-row justify='space-around' class='ma-0 pa-0'>
							<v-col cols='auto' class='ma-0 pa-0 text-right'>
								<span class='text-mealtype mr-1'>original:</span>
								<span class='text-white mr-1'> {{ bytes_to_mb(totalOriginal) }}mb</span>
							</v-col>
							<v-col cols='auto' class='ma-0 pa-0 text-center'>
								<span class='text-mealtype mr-1'>converted:</span>
								<span class='text-white mr-1'>{{ bytes_to_mb(totalConverted) }}mb</span>
							</v-col>
							<v-col cols='auto' class='ma-0 pa-0'>
								<span class='text-mealtype mr-1'>#</span>
								<span class='text-white mr-1'>{{ (photo_data.length) }}</span>
							</v-col>
						</v-row>

					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<v-row class='ma-0 pa-0' justify='space-around'>
			<v-col v-for='(item, index) in photo_data' :key='index' cols='9' sm='5' lg='4'
				class='text-body-1 d-flex child-flex'>

				<template v-if='item.meal_date && item.person'>

					<v-row class='justify-center bg-black ma-0 pa-0'>

						<v-col cols='12' class='ma-0 pa-0'>
							<span :class='item.person === "Dave" ? "text-primary" : "text-secondary"'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a :href='editHref(item)'>{{ item.meal_date }} {{ item.person }}</a>
									</v-col>
								</v-row>
							</span>
						</v-col>

						<v-col cols='12' class='ma-0 pa-0'>
							<v-img v-if='(item.file_name_converted)' :src='env.gen_photo_url(item.file_name_converted)'
								alt='A photograph of a meal' lazy-src='@/assets/tile_svg.svg' max-height='15rem'
								eager />
						</v-col>

						<v-col cols='12' class='ma-0 pa-0'>
							<span :class='item.person === "Dave" ? "text-primary" : "text-secondary"'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a v-if='item.file_name_converted' target='_blank'
											:href='env.gen_photo_url(item.file_name_converted)'>
											<v-icon class='cl' :icon='mdiImageSizeSelectLarge' />
											{{ bytes_to_mb(item.size_in_bytes_converted ?? 0) }}mb
										</a>
									</v-col>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a v-if='item.file_name_original' target='_blank'
											:href='env.gen_photo_url(item.file_name_original)'>
											<v-icon :icon='mdiImageSizeSelectActual' />
											{{ bytes_to_mb(item.size_in_bytes_original ?? 0) }}mb</a>

									</v-col>
								</v-row>
							</span>
						</v-col>
					</v-row>
				</template>
				<template v-else-if='(item.file_name_converted)'>

					<v-row class='justify-center bg-black'>
						<v-col cols='12' class='ma-0 pa-0'>
							<v-img :src='env.gen_photo_url(item.file_name_converted)' alt='A photograph of a meal'
								max-height='15rem' height='15rem' min-height='15rem' cover />
						</v-col>
						<v-col cols='auto' class='ma-0 pa-0 cl text-error'>
							converted: {{ item.file_name_converted }}
						</v-col>
						<v-col cols='auto' class='cl ma-0 pa-0' @click='deletePhoto(item.file_name_converted)'>
							delete
						</v-col>
					</v-row>
				</template>

				<template v-else-if='(item.file_name_original)'>

					<v-row class='justify-center bg-black'>
						<v-col cols='12' class='ma-0 pa-0'>
							<v-img :src='env.gen_photo_url(item.file_name_original)' alt='A photograph of a meal'
								max-height='15rem' height='15rem' min-height='15rem' cover />
						</v-col>
						<v-col cols='auto' class='ma-0 pa-0 cl text-error'>
							original: {{ item.file_name_original }}
						</v-col>
						<v-col cols='auto' class='cl ma-0 pa-0' @click='deletePhoto(item.file_name_original)'>
							delete
						</v-col>
					</v-row>
				</template>
				<template v-else>
					{{ item }}
				</template>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>

import { axios_admin } from '@/services/axios';
import { env } from '@/vanillaTS/env';
import { FrontEndRoutes } from '@/types/const_routes';
import { mdiImageSizeSelectLarge, mdiImageSizeSelectActual } from '@mdi/js';
import { PV, TAdminPhoto } from '@/types';
import { bytes_to_mb } from '@/vanillaTS/helpers';

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

onBeforeMount(async () => {
	browserModule().set_pageTitle('All photos Meal');
	browserModule().set_description('Meal Pedant - all meal photos');
	loading.value = true;
	await get_data();
	
});

//// Delete an unused photo
const deletePhoto = async (name: string): PV => {
	await axios_admin.photo_delete(name);
	await get_data();
};

/// Get the url for the edit page for a given photo
const editHref = (item: TAdminPhoto): string => {
	return `${FrontEndRoutes.EDITMEAL}?person=${item.person}&date=${item.meal_date}`;
};

const photo_data = computed(() => adminModule().allPhotos);

const totalOriginal = computed(() => photo_data.value.reduce((total, i) => total + (i.size_in_bytes_original ?? 0), 0));
const totalConverted = computed(() => photo_data.value.reduce((total, i) => total + (i.size_in_bytes_converted ?? 0), 0));

const totalJack = computed(() => 
	photo_data.value.reduce(
		(acc, { person, size_in_bytes_original = 0, size_in_bytes_converted = 0 }) => {
			if (person === 'Jack') {
				acc[0] += size_in_bytes_original ?? 0;
				acc[1] += size_in_bytes_converted ?? 0;
				acc[2] += 1;
			}
			return acc;
		},
		[0, 0, 0]
	)
);

const totalDave = computed(() => 
	photo_data.value.reduce(
		(acc, { person, size_in_bytes_original = 0, size_in_bytes_converted = 0 }) => {
			if (person === 'Dave') {
				acc[0] += size_in_bytes_original ?? 0;
				acc[1] += size_in_bytes_converted ?? 0;
				acc[2] += 1;
			}
			return acc;
		},
		[0, 0, 0]
	)
);

const init = ref(false);

/// Download all photo data
const get_data = async (): PV => {
	loading.value = true;
	await axios_admin.photo_get();
	loading.value = false;
	init.value = true;
};
</script>

<style>
a {
	all: unset;
}
</style>