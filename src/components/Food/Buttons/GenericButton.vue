<template>
	<v-row justify='center' class='my-2'>
		<v-col cols='12' sm='6' lg='3' xl='2' class='pa-0 my-0'>
			<v-btn
				@click='buttonSection=!buttonSection'
				class='elevation-0'
				block
				large
				text
			>
				<v-row align='center' justify='center'>
					<v-col cols='4'>
						<v-icon class='mr-1' style='vertical-align: middle;' medium >{{ buttonIcon }}</v-icon>
					</v-col>
					<v-spacer />
					<v-col cols='4'>
						<div>
							<span v-if='buttonSection && $vuetify.breakpoint.lgAndUp'>hide</span>
							<span v-if='!buttonSection && $vuetify.breakpoint.lgAndUp'>show</span>
							{{ buttonName }}
						</div>
					</v-col>
					<v-spacer />
					<v-col cols='4'>
						<v-icon class='mr-1' style='vertical-align: middle;' medium >{{ showHideIcon }}</v-icon>
					</v-col>
				</v-row>
			</v-btn>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { foodModule } from '@/store';
import { mdiChevronDown, mdiChevronUp, mdiFilter, mdiMagnify, mdiCalendarRange, mdiPoll } from '@mdi/js';
import Vue from 'vue';

export default Vue.extend({
	name: 'filter-button-component',

	computed: {
		showHideIcon (): string {
			return this.buttonSection ? mdiChevronUp: mdiChevronDown;
		},
		buttonIcon () :string {
			switch (this.buttonName) {
			case 'analysis':
				return this.mdiPoll;
				break;
			case 'date':
				return this.mdiCalendarRange;
				break;
			case 'filters':
				return this.mdiFilter;
				break;
			default:
				return this.mdiMagnify;
				break;
			}
		},
		buttonSection: {
			get: function (): boolean {
				switch (this.buttonName) {
				case 'analysis':
					return foodModule().button_analysis;
					break;
				case 'date':
					return foodModule().button_date;
					break;
				case 'filters':
					return foodModule().button_filters;
					break;
				default:
					return foodModule().button_search;
					break;
				}
			},
			set: function (b: boolean): void {
				switch (this.buttonName) {
				case 'analysis':
					foodModule().set_button_analysis(b);
					break;
				case 'date':
					foodModule().set_button_date(b);
					break;
				case 'filters':
					foodModule().set_button_filters(b);
					break;
				default:
					foodModule().set_button_search(b);
					break;
				}
			}
		}
	},

	data: () => ({
		mdiFilter,
		mdiMagnify,
		mdiCalendarRange,
		mdiPoll
	}),
	
	props: {
		buttonName: {
			type: String,
			required: true
		}
	}
});
</script>