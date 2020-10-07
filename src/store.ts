/*
# Overview

- XxxData / newXxxData: アプリの状態を表現するために十分なJSON化できる型
- Xxx: アプリの挙動を作るために十分有用なメソッドやプロパティを揃えたクラス（Dataのラッパーと見てもいい）
- XxxState / makeXxxState: UIの表示のためにViewに直接渡される、Viewに合わせて形を整えた型
*/

//#region XxxData

interface LapData {
	id: string
	offsetSeconds: number
}
const newLapData = (offsetSeconds: number): LapData => ({
	id: uid("lap-"),
	offsetSeconds,
})
interface TimerData {
	id: string
	title: string
	offsetSeconds: number
	beginDate: string | undefined
	isRunning: boolean
	isFolded: boolean
	isAboutToReset: boolean
	isAboutToRemove: boolean
	laps: LapData[]
}
const newTimerData = (title = "Timer"): TimerData => ({
	beginDate: undefined,
	id: uid("timer-"),
	isAboutToRemove: false,
	isAboutToReset: false,
	isFolded: true,
	isRunning: false,
	laps: [],
	offsetSeconds: 0,
	title,
})
interface AppData {
	timers: TimerData[]
	landing: boolean
}
const newAppData = (): AppData => ({
	timers: [],
	landing: true,
})

//#endregion
//#region Xxx

class Lap {
	constructor(
		public o: LapData, // data (reference)
		readonly p: Timer, // parent (reference)
	) { }
	selfDuration() {
		const { o, p } = this
		const prev = p.prevLap(o.id)
		if (prev) return this.totalDuration() - prev.totalDuration()
		else return this.totalDuration()
	}
	totalDuration() {
		const { o } = this
		return o.offsetSeconds
	}
	remove() {
		const { o, p } = this
		p.removeLap(o.id)
	}
}
class Timer {
	constructor(
		public o: TimerData, // data (reference)
		readonly p: App, // parent (reference)
	) { }
	seconds(): number {
		const { o } = this
		if (o.isRunning) {
			if (!o.beginDate) bug()
			return o.offsetSeconds + date2sec(nowDate()) - date2sec(o.beginDate)
		}
		return o.offsetSeconds
	}
	start() {
		const { o } = this
		o.isRunning = true
		o.beginDate = nowDate()
	}
	pause() {
		const { o } = this
		o.offsetSeconds = this.seconds()
		o.isRunning = false
		o.beginDate = undefined
	}
	reset() {
		const { o } = this
		o.offsetSeconds = 0
		o.isRunning = false
		o.beginDate = undefined
		o.laps = []
	}
	laps() {
		const { o } = this
		return o.laps.map(o => new Lap(o, this))
	}
	prevLap(id: string) {
		const { o } = this
		const i = o.laps.findIndex(o => o.id === id)
		if (i <= 0) return undefined
		return new Lap(o.laps[i - 1], this)
	}
	sinceLastLap() {
		const { o } = this
		if (o.laps.length === 0) return this.seconds()
		return this.seconds() - last(o.laps).offsetSeconds
	}
	removeLap(id: string) {
		const { o } = this
		removeFromArray(o.laps, o => o.id === id)
	}
	addLap() {
		const { o } = this
		o.laps.push(newLapData(this.seconds()))
	}
	toggleFold() {
		const { o } = this
		o.isFolded = !o.isFolded
	}
	resetAlert(v: boolean) {
		const { o } = this
		o.isAboutToReset = v
	}
	removeAlert(v: boolean) {
		const { o } = this
		o.isAboutToRemove = v
	}
	hideAlerts() {
		const { o } = this
		o.isAboutToReset = false
		o.isAboutToRemove = false
	}
	setTitle(title: string) {
		const { o } = this
		o.title = title
	}
	remove() {
		const { o, p } = this
		p.removeTimer(o.id)
	}
	putTimer(id: string) {
		const { o, p } = this
		p.putTimer(id, o.id)
	}
}
class App {
	constructor(
		public o: AppData, // data (reference)
	) { }
	getJSON(): string {
		return JSON.stringify(this.o)
	}
	setJSON(json: string) {
		this.o = JSON.parse(json)
		this.o.landing = true // TODO
	}
	timers() {
		const { o } = this
		return o.timers.map(o => new Timer(o, this))
	}
	removeTimer(id: string) {
		const { o } = this
		removeFromArray(o.timers, o => o.id === id)
	}
	addTimer() {
		const { o } = this
		o.timers.push(newTimerData())
	}
	landingVisibility(f: boolean) {
		const { o } = this
		o.landing = f
	}
	reset() {
		// TODO
		// this.o = newAppData()
		localStorage.removeItem("persist_store")
		location.reload()
	}
	putTimer(from: string, to: string) {
		const { o } = this
		const fi = o.timers.findIndex(o => o.id === from)
		const ft = o.timers.findIndex(o => o.id === to)
		if (fi < 0 || ft < 0) bug()
		const i = o.timers[fi]
		const t = o.timers[ft]
		o.timers[fi] = t
		o.timers[ft] = i
	}
}

//#endregion
//#region XxxState

export type LapState = ReturnType<typeof makeLapState>
const makeLapState = (o: Lap, i: number) => ({
	index: "#" + padZero(i + 1, 2),
	selfDuration: timeStr(o.selfDuration()),
	totalDuration: timeStr(o.totalDuration()),

	remove: () => o.remove(),
})
export type ResetAlertState = ReturnType<typeof makeTimerState>["resetAlert"]
export type RemoveAlertState = ReturnType<typeof makeTimerState>["removeAlert"]
export type TimerState = ReturnType<typeof makeTimerState>
const makeTimerState = (o: Timer) => ({
	id: o.o.id,
	inputId: "timer-title-input-" + o.o.id,
	title: o.o.title,
	duration: timeStr(o.seconds()),
	lapDuration: timeStr(o.sinceLastLap()),
	isRunning: o.o.isRunning,
	isFolded: o.o.isFolded,
	isAboutToReset: o.o.isAboutToReset,
	isAboutToDelete: o.o.isAboutToRemove,
	laps: o.laps().map((o, i) => makeLapState(o, i)),

	start: (e: Event) => { e.stopPropagation(); o.hideAlerts(); o.start(); },
	pause: (e: Event) => { e.stopPropagation(); o.hideAlerts(); o.pause(); },
	addLap: (e: Event) => { e.stopPropagation(); o.hideAlerts(); o.addLap(); },
	toggleFold: () => { o.hideAlerts(); o.toggleFold(); },
	showResetAlert: (e: Event) => { e.stopPropagation(); o.hideAlerts(); o.resetAlert(true); },
	showRemoveAlert: () => { o.hideAlerts(); o.removeAlert(true); },
	// @ts-ignore
	setTitle: (e: Event) => { o.setTitle(e.target.value); },
	resetAlert: {
		yes: () => { o.hideAlerts(); o.reset(); },
		cancel: () => { o.resetAlert(false) },
	},
	removeAlert: {
		yes: () => { o.hideAlerts(); o.remove() },
		cancel: () => { o.removeAlert(false) },
	},

	dragstart: (e: DragEvent) => {
		e.dataTransfer?.setData("text/plain", "#timer_" + o.o.id.split("-")[1])
	},
	dragover: (e: DragEvent) => { e.preventDefault(); },
	drop: (e: DragEvent) => {
		e.preventDefault();
		const t = e.dataTransfer?.getData("text/plain");
		if (t && t.startsWith("#timer_")) {
			const id = "timer-" + t.substr(7);
			o.putTimer(id);
		}
	},
})
export type AppState = ReturnType<typeof makeAppState>
export const makeAppState = (o: App) => ({
	timers: o.timers().map(o => makeTimerState(o)),
	landing: o.o.landing,

	addTimer: () => o.addTimer(),
	reset: () => {
		if (confirm("Do you really want to reset the app? This action cannot be undone.")) {
			o.reset();
		}
	},
	onScroll: (e: Event) => {
		//@ts-ignore
		const elm: HTMLElement = e.target
		o.landingVisibility(elm.scrollTop < 50)
	}
})

//#endregion
//#region Singleton - store

export const store = new App(newAppData())

//#endregion

function uid(prefix = "id_"): string {
	let o = ""
	while (o.length < 8)
		o += Math.random().toString(36).slice(2, 6)
	return prefix + o.slice(0, 8)
}

function date2sec(date: string): number {
	return new Date(date).getTime() / 1000
}
function nowDate(): string {
	return new Date().toISOString()
}
function bug(): never {
	throw "BUG"
}
function removeFromArray<T>(arr: T[], predicate: (o: T) => boolean) {
	// arr: reference
	const i = arr.findIndex(predicate)
	if (i < 0) bug()
	arr.splice(i, 1)
}
function padZero(n: number, len: number) {
	return n.toString().padStart(len, "0")
}
function timeStr(seconds: number) {
	const s = Math.floor(seconds % 60)
	const m = Math.floor(seconds / 60) % 60
	const h = Math.floor(seconds / 3600)

	const ms = padZero(m, 2) + ":" + padZero(s, 2)
	if (h === 0) return ms
	return h + ":" + ms
}
function last<T>(arr: T[]): T {
	return arr[arr.length - 1]
}