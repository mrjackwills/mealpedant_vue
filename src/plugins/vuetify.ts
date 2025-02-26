import 'vuetify/styles';
import '@/scss/variables.scss';

import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { createVuetify, type ThemeDefinition } from 'vuetify';

const customDarkTheme: ThemeDefinition = {
	dark: true,
	colors: {
		primary: '#f5e487',
		secondary: '#6e95c5',
		error: '#6C0505',
		mealtype: '#eda3e4',
		infobar: 'c58f6e',
		offwhite: '#ffeecb',
		dark: '#1e1e1e',
		navmenu: '#363636',
		appbar: '#272727'
	}
};

export default createVuetify({
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi }
	},
	
	theme: {
		defaultTheme: 'customDarkTheme',
		themes: { customDarkTheme }
	}
});