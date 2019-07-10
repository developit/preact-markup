var path = require('path');

var localLaunchers = {
	ChromeNoSandboxHeadless: {
		base: 'Chrome',
		flags: [
			'--no-sandbox',
			// See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
			'--headless',
			'--disable-gpu',
			// Without a remote debugging port, Google Chrome exits immediately.
			'--remote-debugging-port=9333'
		]
	}
};

module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai-sinon'],
		reporters: ['mocha'],

		browsers: ['ChromeNoSandboxHeadless'],
		customLaunchers: localLaunchers,

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
