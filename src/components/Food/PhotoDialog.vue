<template>
	<v-dialog
		v-model='dialog'
		eager
		:max-width='maxWidth'
		scroll-strategy='none'
	>
		<v-card v-intersect='onIntersect'>
			<v-img
				v-if='photoUrlConverted'
				alt='A photograph of a meal'
				class='grey darken-4'
				eager
				:max-height='window_height_70'
				:src='imgSource'
			/>

			<template
				v-for='item in imageCache'
				:key='item'
			>
				<v-img
					v-show='false'
					alt='cached photo'
					class='grey darken-4'
					eager
					max-height='0'
					:src='`${item}`'
				/>
			</template>
			<v-card-actions>

				<v-container class='ma-0 pa-0' fluid>
					<v-row align='center' class='no-gutters ma-0 pa-0 mx-2' justify='space-around'>

						<v-col class='pa-0 ma-0' cols='1'>
							<v-chip
								v-if='authenticated'
								align='center'
								class=''
								color='mealtype'
								density='compact'
								size='small'
								variant='flat'
								@click='downloadOriginalFromStatic'
							>
								<v-icon class='rotated' :icon='mdiPublish' size='small' style='vertical-align: middle' />
							</v-chip>
						</v-col>

						<v-col class='ma-0 pa-0 text-body-2 text-center' cols='10'>
							<span class='text-red-lighten-4 mr-1'>{{ photoDate }}</span>
							<span class='text-uppercase'>{{ mealDescription.slice(0, 1) }}</span>
							<span>{{ mealDescription.slice(1) }}</span>
						</v-col>

						<v-col align='center' class='pa-0 ma-0 text-right' cols='1'>
							<v-chip
								align='center'
								class=''
								color='error'
								density='compact'
								size='small'
								variant='flat'
								@click.stop='closeDialog'
							>
								<v-icon class='ma-0 pa-0' :icon='mdiClose' size='small' />
							</v-chip>
						</v-col>

					</v-row>
				</v-container>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang='ts'>
import { mdiClose, mdiPublish } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { axios_downloadPhoto } from '@/services/axios'
import { env } from '@/vanillaTS/env'
const { mdAndUp } = useDisplay()

const mealViewStore = mealViewModule()
const dialog = computed({
	get (): boolean {
		return mealViewStore.dialog_visible
	},
	set (b: boolean): void {
		mealViewStore.set_dialog_visible(b)
	},
})

const imageCache = computed(() => {
	return Array.from(mealViewStore.photo_cache).map(i => env.gen_photo_url(String(i)))
})

const authenticated = computed(() => userModule().authenticated)
const imgSource = computed(() => env.gen_photo_url(photoUrlConverted.value))
const maxWidth = computed(() => mdAndUp.value ? '60vw' : '100vw')
const photoDate = computed(() => mealViewStore.dialog_photo_date)
const photoPerson = computed(() => mealViewStore.dialog_photo_person)
const mealDescription = computed(() => mealViewStore.dialog_meal_description)
const photoUrlConverted = computed(() => mealViewStore.dialog_photo_url_converted)
const photoUrlOriginal = computed(() => mealViewStore.dialog_photo_url_original)
const window_height_70 = computed(() => window.innerHeight * 0.7)

function closeDialog (): void {
	dialog.value = false
}

// Download the original photo, by adding it to the page as a link and clicking said link
async function downloadOriginalFromStatic (): Promise<void> {
	if (!photoUrlOriginal.value || !authenticated) return
	const image = await axios_downloadPhoto.photo_get(`photo/${photoUrlOriginal.value}`)
	if (image) {
		const url = window.URL.createObjectURL(new Blob([image]))
		const link = document.createElement('a')
		link.href = url
		link.setAttribute('download', `${photoPerson.value}-${photoDate.value}.jpg`)
		document.body.append(link)
		link.click()
		link.remove()
	}
}

const isIntersecting = ref(false)

// Calculate if visible, and save into isIntersecting
function onIntersect (is_i: boolean): void {
	isIntersecting.value = is_i
}

watch(isIntersecting, (i: boolean) => {
	if (!i) {
		window.setTimeout(() => mealViewStore.clear_photo(), 100)
		dialog.value = false
	}
})

</script>

<style>
.rotated {
	transform: rotate(180deg);
}
</style>
