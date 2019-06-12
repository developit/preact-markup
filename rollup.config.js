import path from 'path';
import fs from 'fs';
import babel from 'rollup-plugin-babel';

let pkg = JSON.parse(fs.readFileSync('./package.json'));

let external = Object.keys(pkg.peerDependencies || {}).concat(Object.keys(pkg.dependencies || {}));

export default {
	entry: 'src/index.js',
	dest: pkg.main,
	sourceMap: path.resolve(pkg.main),
	moduleName: pkg.amdName,
	format: 'umd',
	external,
	plugins: [
		babel({
			babelrc: false,
			comments: false,
			exclude: ['node_modules/**'],
			presets: ['@babel/env'],
			plugins: [
				['@babel/plugin-transform-classes', { loose:true }],
				['@babel/plugin-proposal-object-rest-spread'],
				['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
			]
		})
	]
};
