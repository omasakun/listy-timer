import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import replace from "@rollup/plugin-replace";
import * as path from "path";

const files = [
	"index.js",
	"sw.js",
]

export default args => files.map(file => ({
	input: path.join(args.configInDir, file),
	output: [
		{
			name: "index_js",
			file: path.join(args.configOutDir, file),
			format: "iife",
			sourcemap: true,
			sourcemapPathTransform: relPath => path.join("src", path.relative("../..", relPath)),
		}
	],
	plugins: [
		replace({
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
		}), // for workbox
		resolve(),
		commonjs(),
		sourcemaps(),
	],
}));