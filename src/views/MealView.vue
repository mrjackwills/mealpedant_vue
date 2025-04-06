<template>
	<v-expand-transition>
		<v-row class='ma-0 pa-0 min-height' justify='center' v-if='init'>
			<v-col cols='11' class='ma-0 pa-0'>
				<section v-if='is_admin'>
					<InfoBar v-for='(item, index) of infobar_messages' :key='index' :message='item.message'
						:color='item.color' />
				</section>
				<section ref='upper_section'>

					<section v-if='lgAndUp' class='mt-4 ma-0 pa-0'>
						<v-row justify='center' class='no-gutters'>
							<SelectorButton class='ma-0 pa-0' />
						</v-row>

						<v-row justify='center' align='center' class='pa-0 ma-0 mt-n8'>
							<v-col cols='7' class='ma-0 pa-0'>
								<DateRow />
							</v-col>

							<v-col cols='5' class='ma-0 pa-0'>
								<FilterButtons class='ma-0 pa-0' />
							</v-col>
						</v-row>
					</section>

					<section class='' v-if='!lgAndUp'>

						<v-row justify='center' align='center' class='ma-0 pa-0'>
							<v-col cols='12' class='ma-0 pa-0 py-0'>
								<GenericButton buttonName='search' />
							</v-col>

							<v-col cols='12' class='ma-0 pa-0 py-0'>
								<v-expand-transition>
									<v-row justify='center' v-if='show_search' class='ma-0 pa-0 py-0'>
										<SelectorButton />
									</v-row>
								</v-expand-transition>
							</v-col>

							<v-col cols='12' class='ma-0 pa-0 py-0'>
								<GenericButton buttonName='date' />
							</v-col>

							<v-col cols='12' class='pa-0'>
								<v-expand-transition>
									<DateRow v-if='foodDate' />
								</v-expand-transition>
							</v-col>

							<v-col cols='12' class='ma-0 pa-0 py-0'>
								<GenericButton buttonName='filters' />
							</v-col>

							<v-col cols='12' class='pa-0'>
								<v-expand-transition>
									<FilterButtons class='' v-if='show_filters' />
								</v-expand-transition>
							</v-col>
						</v-row>

					</section>

					<v-row justify='center' align='center' class='ma-0 pa-0'>
						<v-col cols='12' class='ma-0 pa-0 py-0'>
							<GenericButton buttonName='analysis' />
						</v-col>
					</v-row>
					<v-expand-transition>
						<v-row justify='center' align='center' class='ma-0 pa-0' v-if='show_analysis'>
							<v-col cols='12' md='11' class='ma-0 pa-0'>
								<AnalysisSection />
							</v-col>
						</v-row>
					</v-expand-transition>

				</section>

				<v-row justify='center' align='center' class='ma-0 pa-0'>
					<v-col cols='12' md='11' class='ma-0 pa-0'>
						<v-expand-transition>
							<MealTable :slot_height='slot_height'  />
						</v-expand-transition>
					</v-col>
				</v-row>

			</v-col>
			<PhotoDialog />
		</v-row>
	</v-expand-transition>

</template>

<script setup lang='ts'>
import { axios_adminMeal } from '@/services/axios';
import { useDisplay } from 'vuetify';
import { useElementSize } from '@vueuse/core';

const { lgAndUp } = useDisplay();

const route = useRoute();

const mealViewStore = mealViewModule();
const mealStore = mealModule();

const el = useTemplateRef('upper_section');

const { height: slot_height } = useElementSize(el);

const foodDate = computed(() => mealViewStore.button_date);
const infobar_messages = computed(() => infobarModule().messages);
const is_admin = computed(() => userModule().admin);
const show_analysis = computed(() => mealViewStore.button_analysis);

const is_filtered = computed(() => mealStore.is_filtered);
watch(is_filtered, (i) => {
	if (i) show_filters.value = true;
});

const init = ref(false);

onBeforeMount(async () => {
	loadingModule().set_loading(true);
	await mealStorage.seed_meal_pinia();
	if (is_admin.value) await axios_adminMeal.missing_get();
	if (lgAndUp.value) [show_search.value, show_filters.value] = [true, true];
	const browserStore = browserModule();
	browserStore.set_pageTitle('Meals');
	browserStore.set_description('Meal Pedant - The main event');
	if (route.query.filter) mealStore.param_to_search(`${route.query.filter}`);
	if (mealStore.search_by.term) browserModule().set_pageTitle(mealStore.search_by.term);
	loadingModule().set_loading(false);
	init.value = true;
});

const show_filters = computed({
	get (): boolean {
		return mealViewStore.button_filters;
	},
	set (b: boolean): void {
		mealViewStore.set_button_filters(b);
	}
});

const show_search = computed({
	get (): boolean {
		return mealViewStore.button_search;
	},
	set (b: boolean): void {
		mealViewStore.set_button_search(b);
	}
});

</script>

<style>
.min-height {
	min-height: 100%;
}
</style>