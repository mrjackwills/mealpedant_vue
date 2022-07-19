/* eslint-disable @typescript-eslint/no-var-requires */
require('es6-promise');
const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: [ './src/main.ts' ],
	output: {
		path: path.resolve(__dirname, './dist'),
		publicPath: '/dist/',
		// filename: 'build.js'
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					{
						loader: 'sass-loader',
					options: {
							additionalData: "@import '@/scss/variables.scss';"
						},
					},
				]
			},
		],
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true
	},
	performance: {
		hints: false
	},
	devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
	module.exports.devtool = '';
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new VuetifyLoaderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			parallel: true,
			mangle: true,
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	]);
}