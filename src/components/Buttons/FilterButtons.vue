<template>
	<v-col cols='auto' class='ma-0 pa-0 mt-lg-12'>
		<v-row justify='space-evenly' align='center' class='no-gutters ma-0 pa-0'>
			
			<v-col cols='auto' class='ma-0 pa-0'>
				<v-chip color='mealtype' rounded variant='flat' class='' :size='chip_size' >
					<v-switch :model-value='only_photos' @update:model-value='update_photos' color='black'
						density='compact' hide-details>
						<template v-slot:label>
							<v-icon :icon='mdiCamera' color='black' class='mr-1' />
							<span class='text-black'>only</span>
						</template>
					</v-switch>
				</v-chip>
			</v-col>
			<template v-if='authenticated'>

				<v-col cols='auto' class='ma-0 pa-0'>
					<v-chip color='primary' rounded variant='flat' class='' :size='chip_size'>
						<v-checkbox :model-value='show_dave' :disabled='!show_jack' @update:model-value='update_person("Dave")' color='black'
							density='compact' hide-details>
							<template v-slot:label>
								<span class='text-black'>Dave</span>
							</template>
						</v-checkbox>
					</v-chip>
				</v-col>

				<v-col cols='auto' class='ma-0 pa-0'>
					<v-chip color='secondary' rounded variant='flat' class='' :size='chip_size'>
						<v-checkbox :model-value='show_jack' :disabled='!show_dave' @update:model-value='update_person("Jack")' color='black'
							density='compact' hide-details>
							<template v-slot:label>
								<span class='text-black'>Jack</span>
							</template>
						</v-checkbox>
					</v-chip>
				</v-col>
			</template>

			<v-col cols='auto' class='ma-0 pa-0' >
				<ClearFilterButton />
			</v-col>
		</v-row>
	</v-col>
</template>

<script setup lang='ts'>
import { TPerson } from '@/types';
import { mdiCamera } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { smAndDown } = useDisplay();

const mealStore = mealModule();
const show_dave = computed(() => mealStore.show_dave);
const show_jack = computed(() => mealStore.show_jack);
const authenticated = computed(() => userModule().authenticated);

const chip_size = computed(() => smAndDown.value ? 'small' : 'default');
/// Has to be the inverse of the value
const only_photos = computed(() => mealStore.search_by.only_photos);

const update_photos = (): void => mealStore.set_search_by_photo();

/// If other person is already disabled, then don't disable the second
const update_person = (person: TPerson): void => {
	if (person === 'Jack' && !show_dave.value || person === 'Dave' && !show_jack.value) return;
	mealStore.set_search_by_person(person);
};
</script>