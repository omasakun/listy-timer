const inDir = process.argv[7];
const inFile = process.argv[8];
const outFile = process.argv[9];
module.exports = {
	globDirectory: inDir,
	globPatterns: [
		"**/*"
	],
  swSrc: inFile,
  swDest: outFile,
};