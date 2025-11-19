<template>
	<v-row class='ma-0 pa-0 mb-1' justify='center'>
		<v-col
			class='pa-0 my-0'
			cols='12'
			lg='3'
			sm='6'
			xl='2'
		>
			<v-btn block variant='text' @click='buttonSection = !buttonSection'>
				<v-row align='center' class='ma-0 pa-0' justify='space-between'>

					<v-col class='text-left ma-0 pa-0' cols='5' md='auto'>
						<v-icon class='mr-1' :icon='buttonIcon' medium style='vertical-align: middle;' />
					</v-col>
					<v-col class='text-left ma-0 pa-0' cols='4' md='auto'>
						<span v-if='buttonSection && lgAndUp'>hide</span>
						<span v-if='!buttonSection && lgAndUp'>show</span>
						{{ buttonName }}
					</v-col>
					<v-col class='ma-0 pa-0 text-right' cols='3' md='auto'>
						<v-icon class='mr-1' medium style='vertical-align: middle;'>{{ showHideIcon }}</v-icon>
					</v-col>

				</v-row>
			</v-btn>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiCalendarRange, mdiChevronDown, mdiChevronUp, mdiFilter, mdiMagnify, mdiPoll } from '@mdi/js'
import { useDisplay } from 'vuetify'
const { lgAndUp } = useDisplay()

const showHideIcon = computed(() => buttonSection.value ? mdiChevronUp : mdiChevronDown)

const buttonIcon = computed((): string => {
	switch (props.buttonName) {
		case 'analysis': {
			return mdiPoll
		}
		case 'date': {
			return mdiCalendarRange
		}
		case 'filters': {
			return mdiFilter
		}
		default: {
			return mdiMagnify
		}
	}
})
const buttonSection = computed({
	get (): boolean {
		switch (props.buttonName) {
			case 'analysis': {
				return mealViewModule().button_analysis
			}
			case 'date': {
				return mealViewModule().button_date
			}
			case 'filters': {
				return mealViewModule().button_filters
			}
			default: {
				return mealViewModule().button_search
			}
		}
	},
	set (b: boolean): void {
		switch (props.buttonName) {
			case 'analysis': {
				mealViewModule().set_button_analysis(b)
				break
			}
			case 'date': {
				mealViewModule().set_button_date(b)
				break
			}
			case 'filters': {
				mealViewModule().set_button_filters(b)
				break
			}
			default: {
				mealViewModule().set_button_search(b)
				break
			}
		}
	},
})

const props = defineProps<{ buttonName: string }>()

</script>

<style>
.v-btn__content {
	width: 100%
}

</style>
