<template>
	<v-row justify='center' class='my-0'>
		<v-col cols='5' >
			<v-text-field
				v-model='startDate'
				:hint='hintStartDate'
				:prepend-icon='mdiCalendarBlank'
				id='start-date'
				label='Start Date'
				persistent-hint
				readonly
			/>
			<v-menu
				v-model='startDateMenuModel'
				:close-on-content-click='false'
				:nudge-right='40'
				activator='#start-date'
				min-width='290px'
				ref='startDateMenuModel'
				transition='scale-transition'
				offset-y
			>
				<v-date-picker
					v-model='startDate'
					@input='startDateInput'
					first-day-of-week='1'
					:min='startDate'
					:max='endDate'
				/>
			</v-menu>
		</v-col>
		<v-col cols='5' class=''>
			<v-text-field
				v-model='endDate'
				:hint='hintEndDate'
				:prepend-icon='mdiCalendarToday'
				id='end-date'
				label='End Date'
				persistent-hint
				readonly
			/>
			<v-menu
				v-model='endDateMenuModel'
				:close-on-content-click='false'
				:nudge-right='40'
				activator='#end-date'
				min-width='290px'
				ref='startDateMenuModel'
				transition='scale-transition'
				offset-y
			>
				<v-date-picker
					v-model='endDate'
					@input='endDateInput'
					first-day-of-week='1'
					:min='startDate'
					:max='endDate'
				/>
			</v-menu>
		</v-col>
	</v-row>
</template>

<script lang='ts'>
import { categoriesModule, foodModule, mealsModule, typesModule } from '@/store';
import { mdiCalendarBlank, mdiCalendarToday } from '@mdi/js';
import { snackError } from '@/services/snack';
import { TCategory, TMealType, TPiniaDateMeal } from '@/types';
import { genesisDate } from '@/vanillaTS/globalConsts';
import Vue from 'vue';
export default Vue.extend({
	name: 'date-row-row-component',
	data: () => ({
		mdiCalendarBlank,
		mdiCalendarToday,
		startDateMenuModel: false,
		endDateMenuModel: false,
	}),
	computed: {
		hintStartDate (): string {
			return this.startDate === new Date(genesisDate).toISOString().slice(0, 10) ? 'Meal Pedant genesis' : '';
		},
		hintEndDate (): string {
			return this.endDate === new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) ? 'Today' : '';
		},
		startDate: {
			get: function (): string {
				return foodModule().date_start;
			},
			set: function (s: string): void {
				foodModule().set_date_start(s);
			}
		},
		endDate: {
			get: function (): string {
				return foodModule().date_end;
			},
			set: function (s: string): void {
				const queries = this.$route.query;
				const query = queries?.endDate;
				if (s && s !== query) this.$router.push({ query: { ...queries, endDate: s } });
				foodModule().set_date_end(s);
			}
		},
		original: {
			get: function (): boolean {
				return foodModule().original;
			},
			set: function (b: boolean): void {
				foodModule().set_original(b);
			}
		},
	},
	methods: {
		startDateInput (): void {
			this.startDateMenuModel = false;
			this.filterDate();
		},
		endDateInput (): void {
			this.endDateMenuModel = false;
			this.filterDate();
		},
		filterDate (): void {
			if (this.startDate >= this.endDate) {
				snackError({ message: 'Start date must be before end date' });
				return ;
			}
			const newMealArray: Array<TPiniaDateMeal> = [];
			const filteredTypes: Set<TMealType> = new Set();
			const filteredCategories: Set<TCategory> = new Set();

			for (const item of mealsModule().meals) {
				if (item.da >= this.startDate && item.da <= this.endDate) {
					newMealArray.push(item);
					if (item.D?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.D?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item.J?.c) {
						const y = categoriesModule().categories.findIndex((i) => i.c === item.J?.c);
						const x = categoriesModule().categories[y];
						if (x) filteredCategories.add(x);
					}
					if (item.J?.r || item.D?.r) filteredTypes.add('restaurant');
					if (item.J?.t || item.D?.t) filteredTypes.add('takeout');
					if (item.J?.v || item.D?.v) filteredTypes.add('vegetarian');
				}
			}
			mealsModule().set_meals(newMealArray);
			typesModule().set_types([ ...filteredTypes ]);
			categoriesModule().set_categories([ ...filteredCategories ]);
			this.original = false;
		},

	},
});
</script>