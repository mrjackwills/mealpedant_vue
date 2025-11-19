<template>
	<v-container v-if='init' class='fill-height' fluid>
		<v-row class='ma-0 pa-0' justify='space-around'>
			<v-col class='ma-0 pa-0text-center' cols='12'>
				<v-row class='ma-0 pa-0 bg-black' justify='space-around'>
					<v-col class='ma-0 pa-0 bg-black' cols='12'>

						<v-row
							v-for='(item, index) in totals'
							:key='index'
							class='ma-0 pa-0'
							:class='{ "smalltext": mdAndDown }'
							justify='space-around'
						>

							<v-col class='ma-0 pa-0' cols='3' md='2'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col :class='`ma-0 pa-0 text-left text-${item.class}`' cols='5'>
										original:
									</v-col>
									<v-col class='ma-0 pa-0 text-right' cols='5'>
										{{ item.original }}mb
									</v-col>
								</v-row>
							</v-col>

							<v-col class='ma-0 pa-0 text-center' cols='3' md='2'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col :class='`ma-0 pa-0 text-left text-${item.class}`' cols='5'>
										converted:
									</v-col>
									<v-col class='ma-0 pa-0 text-right' cols='5'>
										{{ item.converted }}mb
									</v-col>
								</v-row>
							</v-col>

							<v-col class='ma-0 pa-0' cols='1'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col :class='`ma-0 pa-0 text-left text-${item.class}`' cols='5'>
										#
									</v-col>
									<v-col class='ma-0 pa-0 text-right' cols='5'>
										{{ item.total }}
									</v-col>
								</v-row>
							</v-col>
						</v-row>

					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<v-row class='ma-0 pa-0' justify='space-around'>
			<v-col
				v-for='(item, index) in photo_data'
				:key='index'
				class='text-body-1 d-flex child-flex'
				cols='9'
				lg='4'
				sm='5'
			>

				<template v-if='item.meal_date && item.person'>

					<v-row class='justify-center bg-black ma-0 pa-0'>

						<v-col class='ma-0 pa-0' cols='12'>
							<span :class='item.person === "Dave" ? "text-primary" : "text-secondary"'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a :href='editHref(item)'>{{ item.meal_date }} {{ item.person }}</a>
									</v-col>
								</v-row>
							</span>
						</v-col>

						<v-col class='ma-0 pa-0' cols='12'>
							<v-img
								v-if='(item.file_name_converted)'
								alt='A photograph of a meal'
								eager
								lazy-src='@/assets/tile_svg.svg'
								max-height='15rem'
								:src='env.gen_photo_url(item.file_name_converted)'
							/>
						</v-col>

						<v-col class='ma-0 pa-0' cols='12'>
							<span :class='item.person === "Dave" ? "text-primary" : "text-secondary"'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a
											v-if='item.file_name_converted'
											:href='env.gen_photo_url(item.file_name_converted)'
											target='_blank'
										>
											<v-icon class='cl' :icon='mdiImageSizeSelectLarge' />
											{{ bytes_to_mb(item.size_in_bytes_converted ?? 0) }}mb
										</a>
									</v-col>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a
											v-if='item.file_name_original'
											:href='env.gen_photo_url(item.file_name_original)'
											target='_blank'
										>
											<v-icon :icon='mdiImageSizeSelectActual' />
											{{ bytes_to_mb(item.size_in_bytes_original ?? 0) }}mb</a>

									</v-col>
								</v-row>
							</span>
						</v-col>
					</v-row>
				</template>
				<template v-else-if='(item.file_name_converted)'>

					<v-row class='justify-center bg-black ma-0 pa-0'>

						<v-col class='ma-0 pa-0' cols='12'>
							<span class='text-mealtype'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										unused
									</v-col>
								</v-row>
							</span>
						</v-col>

						<v-col class='ma-0 pa-0' cols='12'>
							<v-img
								v-if='(item.file_name_converted)'
								alt='A photograph of a meal'
								eager
								lazy-src='@/assets/tile_svg.svg'
								max-height='15rem'
								:src='env.gen_photo_url(item.file_name_converted)'
							/>
						</v-col>

						<v-col class='ma-0 pa-0' cols='12'>
							<span class='text-mealtype'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a
											v-if='item.file_name_converted'
											:href='env.gen_photo_url(item.file_name_converted)'
											target='_blank'
										>
											<v-icon class='cl' :icon='mdiImageSizeSelectLarge' />
											{{ bytes_to_mb(item.size_in_bytes_converted ?? 0) }}mb
										</a>
									</v-col>
									<v-col
										class='cl ma-0 pa-0'
										cols='auto'
										@click='deletePhoto(item.file_name_converted)'
									>
										<v-chip color='mealtype' size='x-small' variant='flat'>
											delete
										</v-chip>
									</v-col>
								</v-row>
							</span>
						</v-col>
					</v-row>
				</template>

				<template v-else-if='(item.file_name_original)'>

					<v-row class='justify-center bg-black ma-0 pa-0'>

						<v-col class='ma-0 pa-0' cols='12'>
							<span class='text-mealtype'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										unused
									</v-col>
								</v-row>
							</span>
						</v-col>

						<v-col class='ma-0 pa-0' cols='12'>
							<v-img
								v-if='(item.file_name_original)'
								alt='A photograph of a meal'
								eager
								lazy-src='@/assets/tile_svg.svg'
								max-height='15rem'
								:src='env.gen_photo_url(item.file_name_original)'
							/>
						</v-col>

						<v-col class='ma-0 pa-0' cols='12'>
							<span class='text-mealtype'>
								<v-row class='ma-0 pa-0' justify='space-around'>
									<v-col class='ma-0 pa-0 cl' cols='auto'>
										<a
											v-if='item.file_name_original'
											:href='env.gen_photo_url(item.file_name_original)'
											target='_blank'
										>
											<v-icon class='cl' :icon='mdiImageSizeSelectActual' />
											{{ bytes_to_mb(item.size_in_bytes_original ?? 0) }}mb
										</a>
									</v-col>
									<v-col
										class='cl ma-0 pa-0'
										cols='auto'
										@click='deletePhoto(item.file_name_original)'
									>
										<v-chip color='mealtype' size='x-small' variant='flat'>
											delete
										</v-chip>
									</v-col>
								</v-row>
							</span>
						</v-col>
					</v-row>
				</template>

				<!-- Handle any unknown edge case -->
				<template v-else>
					{{ item }}
				</template>
			</v-col>
		</v-row>
	</v-container>
</template>

<script setup lang='ts'>

import { mdiImageSizeSelectActual, mdiImageSizeSelectLarge } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { axios_admin } from '@/services/axios'
import { type PV, type TAdminPhoto, TPerson } from '@/types'
import { FrontEndRoutes } from '@/types/const_routes'
import { env } from '@/vanillaTS/env'
import { bytes_to_mb } from '@/vanillaTS/helpers'
const { mdAndDown } = useDisplay()

const totals = computed(() => [
	{
		class: 'primary',
		original: bytes_to_mb(totalDave.value[0] ?? 0),
		converted: bytes_to_mb(totalDave.value[1] ?? 0),
		total: totalDave.value[2],
	},
	{
		class: 'secondary',
		original: bytes_to_mb(totalJack.value[0] ?? 0),
		converted: bytes_to_mb(totalJack.value[1] ?? 0),
		total: totalJack.value[2],
	},
	{
		class: 'mealtype',
		original: bytes_to_mb(totalOriginal.value),
		converted: bytes_to_mb(totalConverted.value),
		total: photo_data.value.length,
	},
])

const loading = computed({
	get (): boolean {
		return loadingModule().loading
	},
	set (b: boolean): void {
		loadingModule().set_loading(b)
	},
})

onBeforeMount(async () => {
	browserModule().set_pageTitle('All photos Meal')
	browserModule().set_description('Meal Pedant - all meal photos')
	loading.value = true
	await get_data()
})

// // Delete an unused photo
async function deletePhoto (name: string): PV {
	await axios_admin.photo_delete(name)
	await get_data()
}

// / Get the url for the edit page for a given photo
function editHref (item: TAdminPhoto): string {
	return `${FrontEndRoutes.EDITMEAL}?person=${item.person}&date=${item.meal_date}`
}

const photo_data = computed(() => adminModule().allPhotos)

const totalOriginal = computed(() => photo_data.value.reduce((total, i) => total + (i.size_in_bytes_original ?? 0), 0))
const totalConverted = computed(() => photo_data.value.reduce((total, i) => total + (i.size_in_bytes_converted ?? 0), 0))

const totalJack = computed(() => photo_data.value.reduce((acc, { person, size_in_bytes_original = 0, size_in_bytes_converted = 0 }) => {
	if (person === TPerson.JACK) {
		if (acc[0]) acc[0] += size_in_bytes_original ?? 0
		if (acc[1]) acc[1] += size_in_bytes_converted ?? 0
		if (acc[2]) acc[2] += 1
	}
	return acc
}, [0, 0, 0]))

const totalDave = computed(() => photo_data.value.reduce((acc, { person, size_in_bytes_original = 0, size_in_bytes_converted = 0 }) => {
	if (person === TPerson.DAVE) {
		if (acc[0]) acc[0] += size_in_bytes_original ?? 0
		if (acc[1]) acc[1] += size_in_bytes_converted ?? 0
		if (acc[2]) acc[2] += 1
	}
	return acc
}, [0, 0, 0]))

const init = ref(false)

// / Download all photo data
async function get_data (): PV {
	loading.value = true
	await axios_admin.photo_get()
	loading.value = false
	init.value = true
}
</script>

<style>
a {
	all: unset;
}
</style>
