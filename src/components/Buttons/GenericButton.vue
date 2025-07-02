<template>
	<v-row justify='center' class='ma-0 pa-0 mb-1'>
		<v-col cols='12' sm='6' lg='3' xl='2' class='pa-0 my-0'>
			<v-btn @click='buttonSection = !buttonSection' block variant='text'>
				<v-row align='center' justify='space-between' class='ma-0 pa-0'>

					<v-col cols='5' md='auto' class='text-left ma-0 pa-0'>
						<v-icon class='mr-1' style='vertical-align: middle;' medium :icon='buttonIcon' />
					</v-col>
					<v-col cols='4' md='auto' class='text-left ma-0 pa-0'>
						<span v-if='buttonSection && lgAndUp'>hide</span>
						<span v-if='!buttonSection && lgAndUp'>show</span>
						{{ buttonName }}
					</v-col>
					<v-col cols='3' md='auto' class='ma-0 pa-0 text-right'>
						<v-icon class='mr-1' style='vertical-align: middle;' medium>{{ showHideIcon }}</v-icon>
					</v-col>

				</v-row>
			</v-btn>
		</v-col>
	</v-row>
</template>

<script setup lang='ts'>
import { mdiChevronDown, mdiChevronUp, mdiFilter, mdiMagnify, mdiCalendarRange, mdiPoll } from '@mdi/js';
import { useDisplay } from 'vuetify';
const { lgAndUp } = useDisplay();

const showHideIcon = computed(() => buttonSection.value ? mdiChevronUp : mdiChevronDown);

const buttonIcon = computed((): string => {
	switch (props.buttonName) {
		case 'analysis':
			return mdiPoll;
		case 'date':
			return mdiCalendarRange;
		case 'filters':
			return mdiFilter;
		default:
			return mdiMagnify;
	}
});
const buttonSection = computed({
	get (): boolean {
		switch (props.buttonName) {
			case 'analysis':
				return mealViewModule().button_analysis;
			case 'date':
				return mealViewModule().button_date;
			case 'filters':
				return mealViewModule().button_filters;
			default:
				return mealViewModule().button_search;
		}
	},
	set (b: boolean): void {
		switch (props.buttonName) {
			case 'analysis':
				mealViewModule().set_button_analysis(b);
				break;
			case 'date':
				mealViewModule().set_button_date(b);
				break;
			case 'filters':
				mealViewModule().set_button_filters(b);
				break;
			default:
				mealViewModule().set_button_search(b);
				break;
		}
	}
});

const props = defineProps<{ buttonName: string }>();

</script>

<style>
.v-btn__content {
	width: 100%
}

</style>
