/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-var-requires */
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const openInEditor = require('launch-editor-middleware');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// const version = require('./package.json').version;
// const buildDate = require('./package.json').buildDate;
// // Load package.json version number into envs
// process.env.VUE_APP_VERSION = version;
// process.env.VUE_APP_BUILDDATE = new Date(buildDate).toString().substring(0, 24);

const packageJson = require('./package.json')
const version = packageJson.version
process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_BUILDDATE = new Date().toString().substring(0, 24);
process.env.VUE_APP_GITHUB = packageJson.homepage;


const serviceWorkerVersion = version.replace(/\./g, '');

module.exports = {
	pwa: {
		name: 'MealPedant',
		assetsVersion: serviceWorkerVersion,
		themeColor: '#212121',
		msTileColor: '#000000',
		background_color: '#929892',
		iconPaths: {
			favicon32: './img/icons/favicon-32x32.png',
			favicon16: './img/icons/favicon-16x16.png',
			appleTouchIcon: './img/icons/apple-touch-icon.png',
			maskIcon: './img/icons/safari-pinned-tab.svg',
			msTileImage: './img/icons/msapplication-icon-144x144.png'
		},
		manifestOptions: {
			name: 'MealPedant',
			short_name: 'MealPedant',
			start_url: '/',
			display: 'standalone',
			version: serviceWorkerVersion,
		},
		workboxPluginMode: 'GenerateSW',
		corsUseCredentials: true
		// workboxOptions: {
		// swSrc: './src/service-worker.js',
		// },
	},
	// To stop pre-fetching all scripts!
	// CSP stop inlining
	// chainWebpack: config => {
	// config.plugins
	// .delete('prefetch')
	// .delete('split-manifest')
	// .delete('inline-manifest');
	// },
	productionSourceMap: false,
	devServer: {
		before (app) {
			app.use('/__open-in-editor', openInEditor());
		},
		port: '8002',
		host: 'localhost',
		open: false
	},
	transpileDependencies: [ 'vuetify', 'vuex-persist', 'hibp' ],
	// crossorigin: 'use-credentials',
	configureWebpack: {
		optimization: {
			splitChunks: {
				minSize: 20000,
				maxSize: 64000
			},
			mangleWasmImports: true,
			removeAvailableModules: true,
			removeEmptyChunks: true,
			mergeDuplicateChunks: true
		}
	},
};

if (process.env.NODE_ENV === 'production') {
	module.exports.configureWebpack.plugins = (module.exports.configureWebpack.plugins || []).concat([
		new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
		new CompressionWebpackPlugin({
			filename: '[path][base].gz',
			algorithm: 'gzip',
			test: /\.js$|\.css$|\.html$/,
			minRatio: 0.8,
		}),
		new CompressionWebpackPlugin({
			filename: '[path][base].br',
			algorithm: 'brotliCompress',
			test: /\.(js|css|html|svg)$/,
			compressionOptions: {
				level: 11,
			},
			minRatio: 0.8,
		}),
	]);
}