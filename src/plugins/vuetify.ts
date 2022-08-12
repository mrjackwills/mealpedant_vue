import Vue from 'vue';
import { Intersect, Ripple, Touch } from 'vuetify/lib/directives';

import Vuetify, {
	VAlert,
	VApp,
	VAppBar,
	VAppBarNavIcon,
	VAvatar,
	VBanner,
	VBtn,
	VCard,
	VCardTitle,
	VCardText,
	VCardActions,
	VCheckbox,
	VChip,
	VCol,
	VContainer,
	VDataTable,
	VDatePicker,
	VDialog,
	VDivider,
	VExpandTransition,
	VExpandXTransition,
	VFileInput,
	VFooter,
	VForm,
	VIcon,
	VImg,
	VList,
	VListItem,
	VListItemAction,
	VListItemTitle,
	VMain,
	VMenu,
	VNavigationDrawer,
	VProgressCircular,
	VProgressLinear,
	VRadio,
	VRadioGroup,
	VRow,
	VSelect,
	VSimpleTable,
	VSpacer,
	VSnackbar,
	VSwitch,
	VTextarea,
	VTextField,
	VToolbar,
	VToolbarTitle,
	VToolbarItems,
	VTooltip,
} from 'vuetify/lib';

Vue.use(Vuetify, {
	components: {
		VAlert,
		VApp,
		VAppBar,
		VAppBarNavIcon,
		VAvatar,
		VBanner,
		VBtn,
		VCard,
		VCardTitle,
		VCardText,
		VCardActions,
		VCheckbox,
		VChip,
		VCol,
		VContainer,
		VDataTable,
		VDatePicker,
		VDialog,
		VDivider,
		VExpandTransition,
		VExpandXTransition,
		VFileInput,
		VFooter,
		VForm,
		VIcon,
		VImg,
		VList,
		VListItem,
		VListItemAction,
		VListItemTitle,
		VMain,
		VMenu,
		VNavigationDrawer,
		VProgressCircular,
		VProgressLinear,
		VRadio,
		VRadioGroup,
		VRow,
		VSelect,
		VSimpleTable,
		VSpacer,
		VSnackbar,
		VSwitch,
		VTextarea,
		VTextField,
		VToolbar,
		VToolbarTitle,
		VToolbarItems,
		VTooltip,
	},
	directives: {
		Intersect,
		Ripple,
		Touch,
	},
});

const opts = {
	icons: {
		iconfont: <const>'mdiSvg',
		values: {
			register: 'mdiAccountPlus',
			login: 'mdiLogin'
		}
	},
	theme: {
		options: {
			cspNonce: '616c0ep5C6vJDOzyoLv5M6gS40IBR9wOplW05al0Tdhae9EbE1ELmurGX40W3U2516blJenn6hJPLKBs'
		},
		dark: true,
		themes: {
			dark: {
				primary: '#f5e487',
				secondary: '#6e95c5',
				error: '#6C0505',
				mealtype: '#eda3e4',
				infobar: 'c58f6e',
				offwhite: '#ffeecb',
			},
			options: {
				customProperties: true,
				minifyTheme: function (css: string): string {
					return process.env.NODE_ENV === 'production'
						? css.replace(/[\s|\r\n|\r|\n]/g, '')
						: css;
				}
			}
		}
	}
};
export default new Vuetify(opts);