const inDir = process.argv[7];
const outFile = process.argv[8];
module.exports = {
	globDirectory: inDir,
	globPatterns: [
		"**/*"
	],
	swDest: outFile,
	sourcemap: false,

	// https://developers.google.com/web/tools/workbox/guides/common-recipes
	runtimeCaching: [{
		urlPattern: /https:\/\/fonts\.googleapis\.com\/.*/,
		handler: "StaleWhileRevalidate",
		options: {
			cacheName: "google-fonts-stylesheets",
			expiration: {
				maxEntries: 10,
			},
		},
	}, {
		urlPattern: /https:\/\/fonts\.gstatic\.com\/.*/,
		handler: "CacheFirst",
		options: {
			cacheName: "google-fonts-webfonts",
			expiration: {
				maxAgeSeconds: 60 * 60 * 24 * 365,
				maxEntries: 30,
			},
			cacheableResponse: {
				statuses: [0, 200],
			}
		},
	}],
};