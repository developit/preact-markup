var path = require('path');

module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai-sinon'],
		reporters: ['mocha'],

		browsers: ['PhantomJS'],

		files: [
			'test/_setup.js',
			'test/**/*.js'
		],

		preprocessors: {
			'test/**/*.js': ['webpack'],
			'src/**/*.js': ['webpack'],
			'**/*.js': ['sourcemap']
		},

		mochaReporter: {
			showDiff: true
		},

		webpack: {
			module: {
				loaders: [
					{
						test: /\.jsx?$/,
						exclude: /node_modules/,
						loader: 'babel',
						query: {
							sourceMap: 'inline',
							presets: ['es2015-loose', 'stage-0'],
							plugins: [
								'transform-object-rest-spread',
								['transform-react-jsx', { pragma:'h' }]
							]
						}
					}
				]
			},
			resolve: {
				modulesDirectories: [__dirname, 'node_modules'],
				alias: {
					src: __dirname+'/src'
				}
			}
		},

		webpackMiddleware: {
			noInfo: true
		}
	});
};
