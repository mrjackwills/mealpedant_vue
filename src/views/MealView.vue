<template>
	<v-expand-transition>
		<v-row v-if='init' class='ma-0 pa-0 min-height' justify='center'>
			<v-col class='ma-0 pa-0' cols='11'>
				<section v-if='is_admin'>
					<InfoBar
						v-for='(item, index) of infobar_messages'
						:key='index'
						:color='item.color'
						:message='item.message'
					/>
				</section>
				<section ref='upper_section'>

					<section v-if='lgAndUp' class='mt-4 ma-0 pa-0'>
						<v-row class='no-gutters' justify='center'>
							<SelectorButton class='ma-0 pa-0' />
						</v-row>

						<v-row align='center' class='pa-0 ma-0 mt-n8' justify='center'>
							<v-col class='ma-0 pa-0' cols='7'>
								<DateRow />
							</v-col>

							<v-col class='ma-0 pa-0' cols='5'>
								<FilterButtons class='ma-0 pa-0' />
							</v-col>
						</v-row>
					</section>

					<section v-if='!lgAndUp'>

						<v-row align='center' class='ma-0 pa-0' justify='center'>
							<v-col class='ma-0 pa-0 py-0' cols='12'>
								<GenericButton button-name='search' />
							</v-col>

							<v-col class='ma-0 pa-0 py-0' cols='12'>
								<v-expand-transition>
									<v-row v-if='show_search' class='ma-0 pa-0 py-0' justify='center'>
										<SelectorButton />
									</v-row>
								</v-expand-transition>
							</v-col>

							<v-col class='ma-0 pa-0 py-0' cols='12'>
								<GenericButton button-name='date' />
							</v-col>

							<v-col class='pa-0' cols='12'>
								<v-expand-transition>
									<DateRow v-if='foodDate' />
								</v-expand-transition>
							</v-col>

							<v-col class='ma-0 pa-0 py-0' cols='12'>
								<GenericButton button-name='filters' />
							</v-col>

							<v-col class='pa-0' cols='12'>
								<v-expand-transition>
									<FilterButtons v-if='show_filters' class='' />
								</v-expand-transition>
							</v-col>
						</v-row>

					</section>

					<v-row align='center' class='ma-0 pa-0' justify='center'>
						<v-col class='ma-0 pa-0 py-0' cols='12'>
							<GenericButton button-name='analysis' />
						</v-col>
					</v-row>
					<v-expand-transition>
						<v-row v-show='show_analysis' align='center' class='ma-0 pa-0' justify='center'>
							<v-col class='ma-0 pa-0' cols='12' md='11'>
								<AnalysisSection />
							</v-col>
						</v-row>
					</v-expand-transition>

				</section>

				<v-row align='center' class='ma-0 pa-0' justify='center'>
					<v-col class='ma-0 pa-0' cols='12'>
						<v-expand-transition>
							<MealTable :slot-height />
						</v-expand-transition>
					</v-col>
				</v-row>

			</v-col>
			<PhotoDialog />
		</v-row>
	</v-expand-transition>

</template>

<script setup lang='ts'>
import { useElementSize } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import { axios_adminMeal } from '@/services/axios'

const { lgAndUp } = useDisplay()

const route = useRoute()

const mealViewStore = mealViewModule()
const mealStore = mealModule()

const el = useTemplateRef('upper_section')

const { height: slotHeight } = useElementSize(el)

const foodDate = computed(() => mealViewStore.button_date)
const infobar_messages = computed(() => infobarModule().messages)
const is_admin = computed(() => userModule().admin)
const show_analysis = computed(() => mealViewStore.button_analysis)

const is_filtered = computed(() => mealStore.is_filtered)
watch(is_filtered, (i: boolean) => {
	if (i) show_filters.value = true
})

const init = ref(false)

onBeforeMount(async () => {
	loadingModule().set_loading(true)
	await mealStorage.seed_meal_pinia()
	if (is_admin.value) await axios_adminMeal.missing_get()
	if (lgAndUp.value) [show_search.value, show_filters.value] = [true, true]
	const browserStore = browserModule()
	browserStore.set_pageTitle('Meals')
	browserStore.set_description('Meal Pedant - The main event')
	if (route.query.filter) mealStore.param_to_search(`${route.query.filter}`)
	if (mealStore.search_by.term) browserModule().set_pageTitle(mealStore.search_by.term)
	loadingModule().set_loading(false)
	init.value = true
})

const show_filters = computed({
	get (): boolean {
		return mealViewStore.button_filters
	},
	set (b: boolean): void {
		mealViewStore.set_button_filters(b)
	},
})

const show_search = computed({
	get (): boolean {
		return mealViewStore.button_search
	},
	set (b: boolean): void {
		mealViewStore.set_button_search(b)
	},
})

</script>

<style>
.min-height {
	min-height: 100%;
}
</style>
