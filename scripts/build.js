const { buildDirPlaceholders, Builder: Forestini, exec } = require("forestini")
const { notify } = require("node-notifier")

// boilerplate
const fo = new Forestini({ tmpDir: ".tmp" })
const { i0, o, c } = buildDirPlaceholders
const options = name => process.argv.some(o => o === name)

// args
// const isProd = options("prod")
const watchMode = options("watch")

// commands
const tsc = exec({ persistentOutput: true, displayName: "tsc" }) // TODO: `--rootDir ${i0}`
	`tsc --outDir ${o} --incremental --tsBuildInfoFile ${c}/.tsbuildinfo --project tsconfig.json` // NOTE: `--pretty` option enables rich log output 

const rollup = exec({ displayName: "rollup" })
	`rollup --silent --config scripts/rollup.config.js --configInDir ${i0} --configOutDir ${o}`

const sass = exec({ persistentOutput: true, displayName: "sass" })
	`sass ${() => i0() + ":" + o()} --no-source-map --update --indented --style=expanded --color --quiet` // TODO: `--quiet` might not be good

const workbox = exec({ displayName: "workbox" })
	`workbox injectManifest scripts/workbox-config.js --loglevel error --color ${i0}/ ${i0}/sw.js ${o}/sw.js`

// task chains
const src = fo.src("src")
const ts = src.filterFiles("**/@(*.ts|*.tsx)").cache().then(tsc)
const scripts = fo.merge([ts, src.filterFiles("**/*.js")]).cache().then(rollup)
const styles = src.filterFiles("**/@(*.sass)").cache().then(sass)
const assets = src.filterFiles("**/!(*.ts|*.tsx|*.js|*.sass)")
const merged = fo.merge([scripts, styles, assets])

if (watchMode) {
	const dest = merged

	dest.browserSync({
		logPrefix: "BS",
		open: false,
		port: 8137,
		ui: { port: 8138 },
		logFileChanges: false,
		notify: false,
		reloadOnRestart: true,
	})
	dest.asyncBuild(async () => notify({ icon: "dialog-information", title: "Forestini", message: "Build Successful!" }))
} else {
	const offline = merged.cache().then(workbox)
	const dest = fo.merge([merged, offline])

	dest.dest("dest")
}

// begin processing
if (watchMode) {
	fo.freeze().watch()
} else {
	fo.freeze().build().then(({ err }) => {
		if (err) process.exit(1);
	})
}