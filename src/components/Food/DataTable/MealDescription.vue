<template>
	<v-col
		class='ma-0 pa-0'
		:class='computedFont'
		cols='12'
		justify='start'
		@mouseover='loadPhoto'
	>
		<router-link v-if='admin' :class='[categoryColor, { "cl": admin }]' :to='editHref'> {{ formatCategoryName(category) }}</router-link>
		<span v-else :class='categoryColor'>{{ formatCategoryName(category) }}</span>
		<span
			v-if='restaurant'
			v-tooltip:top='"Restaurant"'
			class='font-weight-bold text-uppercase ml-1 text-mealtype'
		>r</span>
		<span
			v-if='takeaway'
			v-tooltip:top='"Takeaway"'
			class='font-weight-bold text-uppercase ml-1 text-mealtype'
		>t</span>
		<span
			v-if='vegetarian'
			v-tooltip:top='"Vegetarian"'
			class='font-weight-bold text-uppercase ml-1 text-mealtype'
		>v</span>
	</v-col>
	<v-col class='ma-0 pa-0' :class='computedFont' cols='12'>
		{{ formatDescription(description) }}
	</v-col>
	<v-col v-if='photo?.converted' align='self-end' class='ma-0 pa-0' cols='12'>
		<v-chip
			v-intersect='onIntersect'
			class='ma-0 pa-0 mt-1 mb-2 px-2'
			color='mealtype'
			density='compact'
			size='small'
			variant='flat'
			@click='showPhoto'
		>
			<v-row align='center' class='ma-0 pa-0' justify='center'>
				<v-col class='ma-0 pa-0 mr-1' cols='auto'>
					<v-icon
						color='black'
						:icon='mdiCamera'
						:size='smAndDown?"x-small":"small"'
						style='vertical-align: middle;'
					/>
				</v-col>
				<v-col class='ma-0 pa-0 text-black text-caption' :class='computedFont' cols='auto'>
					view
				</v-col>
			</v-row>
		</v-chip>
	</v-col>
</template>

<script setup lang='ts'>
import { mdiCamera } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { type PersonPhoto, TPerson, type TPersonVal } from '@/types'
import { FrontEndRoutes } from '@/types/const_routes'
import { formatCategoryName } from '@/vanillaTS/helpers'
const { mdAndDown, smAndDown } = useDisplay()

const admin = computed(() => userModule().admin)
const category = computed(() => mealModule().get_category_by_id(props.mealCategoryId))
const categoryColor = computed(() => props.person === TPerson.DAVE ? 'text-primary ' : 'text-secondary')
const computedFont = computed(() => mdAndDown ? '' : 'text-body-1')
const description = computed(() => mealModule().get_description_by_id(props.mealDescriptionId))
const formatDescription = (description: string): string => `${description.slice(0, 1).toUpperCase()}${description.slice(1)}`
const mealViewStore = mealViewModule()

function onIntersect (intersecting: boolean): void {
	if (props.photo?.converted) {
		if (intersecting) {
			mealViewStore.add_photo_cache(props.photo.converted)
		} else {
			mealViewStore.remove_photo_cache(props.photo.converted)
		}
	}
}

const editHref = computed(() => {
	return `${FrontEndRoutes.EDITMEAL}?person=${props.person}&date=${props.date}`
})

function loadPhoto (): void {
	if (props.photo?.converted) mealViewStore.set_dialog_photo_url_converted(props.photo.converted)
	if (props.photo?.original) mealViewStore.set_dialog_photo_url_original(props.photo.original)
	mealViewStore.set_photo_date(props.date)
	mealViewStore.set_dialog_photo_person(props.person)
	mealViewStore.set_dialog_photo_meal_description(description.value)
}
function showPhoto (): void {
	loadPhoto()
	mealViewStore.set_dialog_visible(true)
}

const props = withDefaults(defineProps<{
	mealCategoryId: number
	date: string
	mealDescriptionId: number
	person: TPersonVal
	photo?: PersonPhoto
	restaurant?: boolean
	takeaway?: boolean
	vegetarian?: boolean
}>(), {
	restaurant: false,
	takeaway: false,
	vegetarian: false,
	photo: undefined,

})

</script>
