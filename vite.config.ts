import type { VitePWAOptions } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
// Plugins
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
// Utilities
import Unfonts from 'unplugin-fonts/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

import babel from 'vite-plugin-babel'
import compression from 'vite-plugin-compression2'

import { VitePWA } from 'vite-plugin-pwa'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

const pwaOptions: Partial<VitePWAOptions> = {
	base: '/',
	registerType: 'prompt',
	includeAssets: ['favicon.ico'],
	manifest: {
		display: 'standalone',
		name: 'MealPedant',
		description: 'A meticulous daily log of ingestion',
		short_name: 'MealPedant',
		theme_color: '#212121',
		background_color: '#929892',
		id: process.env.npm_package_version,
		icons: [
			{
				src: 'img/icons/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: 'img/icons/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},

		],
	},
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({ template: { transformAssetUrls } }),
		// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
		vuetify({ autoImport: true }),
		Components(),
		AutoImport({
			include: [
				/\.[tj]sx?$/,
				/\.vue$/,
				/\.vue\?vue/,
				/\.md$/,
			],
			imports: [
				'vue',
				'vue-router',
			],
			dts: 'src/auto-imports.d.ts',
			eslintrc: { enabled: true },
			dirs: ['src/store'],
			vueTemplate: false,
		}),
		Unfonts({
			custom: {
				families: [
					{
						name: 'Hammersmith One',
						local: 'Hammersmith One',
						src: './src/assets/fonts/*.woff2',
					},
				],
				display: 'auto',
				preload: true,
				injectTo: 'head-prepend',
			},
		}),
		VitePWA(pwaOptions),
		compression({
			algorithms: ['brotliCompress', 'gzip'],
			exclude: [/\.(br)$/, /\.(gz)$/],
		}),
		/// This is an incredibly annoying problem
		// https://github.com/oxc-project/oxc/issues/20133
		// Transform TC39 standard decorators (@observable accessor) before OXC strips types.
		// @vitejs/plugin-react v6 is OXC-only; OXC passes TC39 decorators through unchanged.
		// vite-plugin-babel runs enforce:'pre' (before OXC) and transforms them via Babel.
		babel({
			filter: /\.[jt]sx?$/, // include .ts/.tsx (default only matches .js/.jsx)
			exclude: /node_modules/, // skip pre-compiled library code
			babelConfig: {
				babelrc: false,
				configFile: false,
				plugins: [
					// Allow Babel to parse TypeScript/TSX syntax (types remain for OXC to strip)
					['@babel/plugin-syntax-typescript', { allExtensions: true, isTSX: true }],
					// Transform TC39 standard decorators (version '2023-05' = ECMAScript 2023 proposal)
					['@babel/plugin-proposal-decorators', { version: '2023-11' }],
				],
			},
		}),
	],
	oxc: {},
	define: {
		'process.env': {},
		'import.meta.env.BUILD_DATE': Date.now(),
		'import.meta.env.VERSION': JSON.stringify(process.env.npm_package_version),
	},
	resolve: {
		alias: { '@': fileURLToPath(new URL('src', import.meta.url)) },
		extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
	},
	server: {
		port: 8002,
		host: '127.0.0.1',
	},
})
