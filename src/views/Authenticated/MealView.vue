<template>
	<v-container
		v-if='pageReady'
		container--fluid
		fill-height
	>
		<v-row class='ma-o pa-0'>
			<v-col cols='12' class='ma-0'>

				<div v-for='(item, index) of infobar_messages' :key='index'>
					<InfoBar :message='item.message' :color='item.color'/>
				</div>

				<section  v-if='lgAndUp'>
					<v-row justify='center' class='no-gutters'>
						<SelectorButton class='my-0'/>
					</v-row>
			
					<v-row justify='center' align='center' class='pa-0 my-0'>
						<v-col cols='7' class='pa-0 my-0'>
							<DateRow />
						</v-col>
				
						<v-col cols='5' class='pa-0 my-0'>
							<FilterButtons class=''/>
						</v-col>
					</v-row>
				</section>

				<!-- Mobile view only -->
				<section class='mx-1' v-else>
		
					<v-row justify='center' align='center' class='ma-0 pa-0 py-'>
						<v-col cols='12' class='ma-0 pa-0 py-0'>
							<GenericButton buttonName='search' />
						</v-col>

						<v-col cols='12' class='ma-0 pa-0 py-0'>
							<v-expand-transition>
								<v-row justify='center' v-if='search' class='ma-0 pa-0 py-0'>
									<SelectorButton />
								</v-row>
							</v-expand-transition>
						</v-col>

						<v-col cols='12' class='ma-0 pa-0 py-0'>
							<GenericButton buttonName='date' />
						</v-col>

						<v-col cols='12' class='pa-0'>
							<v-expand-transition>
								<div v-if='foodDate'>
									<DateRow />
								</div>
							</v-expand-transition>
						</v-col>

						<v-col cols='12' class='ma-0 pa-0 py-0'>
							<GenericButton buttonName='filters' />
						</v-col>

						<v-col cols='12' class='pa-0'>
							<v-expand-transition>
								<div v-if='filters'>
									<FilterButtons class='' />
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
											@click='resetFilters'
											:color='item.color'
											:disabled='original'
											class='mx-2'
											rounded
											small
										>
											<v-row align='center' justify='center'>
												<v-col cols='auto' class='pa-1'>
													<ButtonIcon :icon='item.icon' margin='' :small='true' />
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

				</section>
		
				<v-row justify='center' align='center' class='ma-0 pa-0 py-0'>
					<v-col cols='12' class='my-0 pa-0'>
						<GenericButton buttonName='analysis'/>
					</v-col>
					<v-col cols='12' class='ma-0 pa-0 py-0' >
						<v-expand-transition>
							<AnalysisSection v-show='analysis' />
						</v-expand-transition>
					</v-col>
				</v-row>
		
				<v-row justify='center' align='center' class='ma-0 pa-0 py-0'>
					<v-col cols='12' md='10' class='my-0' >
						<MealTable />
					</v-col>
				</v-row>
		
				<DownloadDialog />
				<UpArrow />
				<RefreshButton />
			</v-col>
		</v-row>
	</v-container>

</template>

<script setup  lang='ts'>
import { axios_adminMeal } from '@/services/axios';
import { dexieDB } from '@/services/dexieDb';
import { mdiRefresh } from '@mdi/js';
import { resetFilters } from '@/services/reset';
import type { TInfobarmessage } from '@/types';
import { useDisplay } from 'vuetify';

const { lgAndUp } = useDisplay();

onBeforeUnmount(async () => {
	await resetFilters();

});

onBeforeMount(async () => {
	loading.value = true;
	await dexieDB.check_last_id();
	const isAdmin = userModule().admin;
	if (isAdmin) await axios_adminMeal.missing_get();
	if (lgAndUp.value) [ search.value, filters.value ] = [ true, true ];
	pageReady.value = true;
	loading.value = false;
	const browserStore = browserModule();
	browserStore.set_pageTitle('Meals');
	browserStore.set_description('Meal Pedant - The main event');
});

const loading = computed({
	get (): boolean {
		return loadingModule().loading;
	},
	set (b: boolean): void {
		loadingModule().set_loading(b);
	}
});

// 	computed: {
// const dialog = computed((): boolean => {
// 	return foodModule().dialog;
// });
const analysis = computed((): boolean => {
	return foodModule().button_analysis;
});
const infobar_messages = computed((): Array<TInfobarmessage> =>{
	return infobarModule().messages;
	// TODO fix me
	// return [ abc[0], abc[1], abc[2] ];
});
const original = computed((): boolean => {
	return foodModule().original;
});
const filters = computed({
	get (): boolean {
		return foodModule().button_filters;
	},
	set (b: boolean): void {
		foodModule().set_button_filters(b);
	}
});
const search = computed({
	get (): boolean {
		return foodModule().button_search;
	},
	set (b: boolean): void {
		foodModule().set_button_search(b);
	}
});

const foodDate = computed((): boolean => {
	return foodModule().button_date;
});

const pageReady = ref(false);
const buttonFields = [ { disabled: 'original', click: 'reset', icon: mdiRefresh, text: 'reset', color: 'error', flat: true } ];
		
</script>