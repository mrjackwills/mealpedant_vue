<template>
	<v-container v-if='pageReady' container--fluid class='' id='parrot'>
		<template >
			<div v-for='(item, index) of infobar_messages' :key='index'>
				<app-info-bar :message='item.message' :color='item.color'/>
			</div>
		</template>

		<v-row justify='center' class='no-gutters '>

			<template v-if='$vuetify.breakpoint.lgAndUp'>
				<app-selectors class='my-0'/>
			
				<v-row justify='center' align='center' class='pa-0 my-0'>
					<v-col cols='auto' class='pa-0 my-0'>
						<app-date-row />
					</v-col>
					<v-col cols='auto' class='pa-0 my-0'>
						<app-filter-buttons-row class=''/>
					</v-col>
				</v-row>
			</template>

			<!-- Mobile view only -->

			<template v-else>
		
				<v-row justify='center' align='center' class='ma-0 pa-0 py-0'>
					<v-col cols='12' class='ma-0 pa-0 py-0'>
						<app-generic-button buttonName='search' />
					</v-col>

					<v-col cols='12' class='ma-0 pa-0 py-0'>
						<v-expand-transition>
							<v-row justify='center' v-if='search' class='ma-0 pa-0 py-0'>
								<app-selectors />
							</v-row>
						</v-expand-transition>
					</v-col>

					<v-col cols='12' class='ma-0 pa-0 py-0'>
						<app-generic-button buttonName='date' />
					</v-col>

					<v-col cols='12' class='pa-0'>
						<v-expand-transition>
							<div v-if='foodDate'>
								<app-date-row />
							</div>
						</v-expand-transition>
					</v-col>

					<v-col cols='12' class='ma-0 pa-0 py-0'>
						<app-generic-button buttonName='filters' />
					</v-col>

					<v-col cols='12' class='pa-0'>
						<v-expand-transition>
							<div v-if='filters'>
								<app-filter-buttons-row class='' />
							</div>
						</v-expand-transition>
					</v-col>
				</v-row>

				<v-col cols='12' class='pa-0'>
					<v-expand-transition >
						<div v-if='!original'>
							<v-row justify='center' dense class='ma-0 pa-0 py-0'>
								<v-col v-for='(item, index) in buttonFields' :key='index' cols='12' shrink class='text-center pa-0'>
									<v-btn
										class='mx-2'
										small
										rounded
										:disabled='original'
										:color='item.color'
										@click='reset'>
										<v-row align='center' justify='center'>
											<v-col cols='auto' class='pa-1'>
												<app-button-icon :icon='item.icon' margin='' :small='true' />
											</v-col>
											<v-col cols='auto' class='pa-1'>
												<div>{{ item.text }}</div>
											</v-col>
										</v-row>
									</v-btn>
								</v-col>
							</v-row>
						</div>
					</v-expand-transition>
				</v-col>

			</template>
		</v-row>

		<v-row justify='center' align='center' class='ma-0 pa-0 py-0'>
			<v-col cols='12' class='my-0 pa-0'>
				<app-generic-button buttonName='analysis'/>
			</v-col>
			<v-col cols='12' class='ma-0 pa-0 py-0' >
				<v-expand-transition>
					<app-analysis-section v-show='analysis' />
				</v-expand-transition>
			</v-col>
		</v-row>
		<v-row justify='center' align='center' class='ma-0 pa-0 py-0'>
			<v-col cols='12' md='9' class='my-0' >
				<app-data-table />
			</v-col>
		</v-row>
		<app-dialog />
		<app-up-arrow />
		<app-refresh />
		
	</v-container>
</template>

<script lang='ts'>
import { axios_adminMeal } from '@/services/axios';
import { dexieDB } from '@/services/dexieDB';
import { env } from '@/vanillaTS/env';
import { foodModule, infobarModule, loadingModule, userModule } from '@/store';
import { mdiRefresh } from '@mdi/js';
import { MetaInfo } from 'vue-meta';
import { resetFilters } from '@/services/reset';
import { TInfobarmessage } from '@/types';
import AnalysisSection from '@/components/Food/AnalysisSection/AnalysisSection.vue';
import ButtonIcon from '@/components/ButtonIcon.vue';
import DataTable from '@/components/Food/DataTable/Table.vue';
import DateRow from '@/components/Food/Buttons/DateRow.vue';
import Dialog from '@/components/Food/DownloadDialog.vue';
import FilterButtonsRow from '@/components/Food/Buttons/FilterButtonsRow.vue';
import GenericButton from '@/components/Food/Buttons/GenericButton.vue';
import InfoBar from '@/components/InfoBar.vue';
import Refresh from '@/components/Food/Refresh.vue';
import Selectors from '@/components/Food/Buttons/Selectors.vue';
import UpArrow from '@/components/UpArrow.vue';
import Vue from 'vue';

export default Vue.extend({
	name: 'food-page',

	components: {
		appGenericButton: GenericButton,
		appAnalysisSection: AnalysisSection,
		appButtonIcon: ButtonIcon,
		appDataTable: DataTable,
		appDateRow: DateRow,
		appDialog: Dialog,
		appFilterButtonsRow: FilterButtonsRow,
		appInfoBar: InfoBar,
		appSelectors: Selectors,
		appUpArrow: UpArrow,
		appRefresh: Refresh
	},

	async beforeDestroy () {
		await resetFilters();
	},

	async beforeMount () {
		this.loading = true;
		await dexieDB.check_last_id();
		const isAdmin = userModule().admin;
		if (isAdmin) await axios_adminMeal.missing_get();
		if (this.$vuetify.breakpoint.lgAndUp) [ this.search, this.filters ] = [ true, true ];
		this.pageReady = true;
		this.loading = false;
	},

	computed: {
		dialog (): boolean {
			return foodModule().dialog;
		},
		analysis (): boolean {
			return foodModule().button_analysis;
		},
		infobar_messages (): Array<TInfobarmessage> {
			return infobarModule().messages;
		},
		original (): boolean {
			return foodModule().original;
		},
		filters: {
			get: function (): boolean {
				return foodModule().button_filters;
			},
			set: function (b: boolean): void {
				foodModule().set_button_filters(b);
			}
		},
		search: {
			get: function (): boolean {
				return foodModule().button_search;
			},
			set: function (b: boolean): void {
				foodModule().set_button_search(b);
			}
		},
		loading: {
			get: function (): boolean {
				return loadingModule().loading;
			},
			set: function (b: boolean): void {
				loadingModule().set_loading(b);
			}
		},
		foodDate (): boolean {
			return foodModule().button_date;
		}
	},

	data: () => ({
		pageReady: false,
		pageTitle: 'Meals',
		buttonFields: [ { disabled: 'original', click: 'reset', icon: mdiRefresh, text: 'reset', color: 'error', flat: true } ]
		
	}),

	metaInfo (): MetaInfo {
		return {
			title: this.pageTitle,
			link: [
				{ rel: 'canonical', href: `${env.domain_www}${this.$route.path}` }
			]
		};
	},

	methods: {
		async reset (): Promise<void> {
			await resetFilters();
		},
	},
});
</script>