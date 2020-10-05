showBanner();
normalizeURL();

function showBanner() {
	const banner = [
		"+-------------------+  ",
		"|                   |  自分の作業が速いのか遅いのかわからない。",
		"|                   |  作業にかかる労力もうまく見積もれない。",
		"|    Listy Timer    |  本当はすぐ終わる作業さえ、怪物のように思えてしまう。",
		"|                   |  ",
		"|                   |  だから時間を測ることにした。",
		"|                   |  自分がこなせる作業量が前よりわかるようになった。",
		"|                   |  成せないこともあるんだと前よりわかるようになった。",
		"|   2020 omasakun   |  ",
		"|                   |  タイマーは生活の一部となった。",
		"+-------------------+  ",
	].join("\n");
	console.log(banner);
}

function normalizeURL() {
	const { origin, search, hash, href } = location;
	const newURL = origin + "/" + search + hash;
	if (href !== newURL) {
		console.log(`URL normalization: ${href} -> ${newURL}`);
		history.replaceState(null, "", newURL);
	}
}

function neverHere(_: never) {
	throw "BUG!!!";
}