import { render } from "lit-html";
import { makeAppState, store } from "./store";
import { app as view } from "./view";

showBanner();
normalizeURL();
persistStore();
autoRender();
installServiceWorker();

function autoRender() {
	const fn = () => {
		render(view(makeAppState(store)), document.body)
		requestAnimationFrame(fn)
	}
	requestAnimationFrame(fn)
}
function persistStore() {
	const json = localStorage.getItem("persist_store");
	if (json) store.setJSON(json);
	const save = () => localStorage.setItem("persist_store", store.getJSON());
	window.addEventListener("unload", () => save());
	setInterval(() => save(), 10000);
}

function installServiceWorker() {
	if ("serviceWorker" in navigator) {
		const { hostname } = location;
		if (hostname.endsWith("o137.dev") || hostname.endsWith("netlify.app")) { // for debug
			window.addEventListener("load", () => {
				navigator.serviceWorker.register("/sw.js");
			});
		}
	}
}

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