<template>
	<v-col class='ma-0 pa-0 mt-lg-12' cols='auto'>
		<v-row align='center' class='no-gutters ma-0 pa-0' justify='space-evenly'>

			<v-col class='ma-0 pa-0' cols='auto'>
				<v-chip
					class=''
					color='mealtype'
					rounded
					:size='chip_size'
					variant='flat'
				>
					<v-switch
						color='black'
						density='compact'
						hide-details
						:model-value='only_photos'
						@update:model-value='update_photos'
					>
						<template #label>
							<v-icon class='mr-1' color='black' :icon='mdiCamera' />
							<span class='text-black'>only</span>
						</template>
					</v-switch>
				</v-chip>
			</v-col>
			<template v-if='authenticated'>

				<v-col class='ma-0 pa-0' cols='auto'>
					<v-chip
						class=''
						color='primary'
						rounded
						:size='chip_size'
						variant='flat'
					>
						<v-checkbox
							color='black'
							density='compact'
							:disabled='!show_jack'
							hide-details
							:model-value='show_dave'
							@update:model-value='update_person("Dave")'
						>
							<template #label>
								<span class='text-black'>Dave</span>
							</template>
						</v-checkbox>
					</v-chip>
				</v-col>

				<v-col class='ma-0 pa-0' cols='auto'>
					<v-chip
						class=''
						color='secondary'
						rounded
						:size='chip_size'
						variant='flat'
					>
						<v-checkbox
							color='black'
							density='compact'
							:disabled='!show_dave'
							hide-details
							:model-value='show_jack'
							@update:model-value='update_person("Jack")'
						>
							<template #label>
								<span class='text-black'>Jack</span>
							</template>
						</v-checkbox>
					</v-chip>
				</v-col>
			</template>

			<v-col class='ma-0 pa-0' cols='auto'>
				<ClearFilterButton />
			</v-col>
		</v-row>
	</v-col>
</template>

<script setup lang='ts'>
import type { TPerson } from '@/types'
import { mdiCamera } from '@mdi/js'
import { useDisplay } from 'vuetify'
const { smAndDown } = useDisplay()

const mealStore = mealModule()
const show_dave = computed(() => mealStore.show_dave)
const show_jack = computed(() => mealStore.show_jack)
const authenticated = computed(() => userModule().authenticated)

const chip_size = computed(() => smAndDown.value ? 'small' : 'default')
// Has to be the inverse of the value
const only_photos = computed(() => mealStore.search_by.only_photos)

const update_photos = (): void => mealStore.set_search_by_photo()

// If other person is already disabled, then don't disable the second
function update_person (person: TPerson): void {
	if ((person === 'Jack' && !show_dave.value) || (person === 'Dave' && !show_jack.value)) return
	mealStore.set_search_by_person(person)
}
</script>
