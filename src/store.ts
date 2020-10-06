/*
unistoreを使おうと思っていたが、直接stateを書き換えられないストレスに見合うだけのメリットを受けられない気がしたので、かといってimmerを導入するのも心理的な障壁が邪魔してくるので、シンプルな方法を取ることにした。
規模が小さいからできることかもしれない。

- 状態はシリアライズ可能にする。その限りで、当然stateはメソッドを持ってもいい
	-> localStorageに状態を保持させたりするのが簡単になる
- 状態の更新は用途ごとに用意された関数を通して行う
- 状態の更新を監視する関数subscribeを用意する
	-> 自動再描画を可能にしたりとかする
*/

class LapState {
	id = uid("lap-")
	offsetSeconds: number
	constructor(offsetSeconds: number) {
		this.offsetSeconds = offsetSeconds
	}
	serialize() {
		const { id, offsetSeconds } = this
		return ({ id, offsetSeconds })
	}
	static deserialize(code: any) {
		const { id, offsetSeconds } = code
		const o = new LapState(offsetSeconds)
		o.id = id
		return o
	}
}
export type ROLapState = Readonly<Pick<LapState, "id" | "offsetSeconds">>
class TimerState {
	id = uid("timer-")
	title: string
	offsetSeconds = 0
	beginDate: string | undefined = undefined
	isRunning = false
	isFolded = true
	isAboutToReset = false
	isAboutToDelete = false
	laps: LapState[] = []
	constructor(title = "Timer") {
		this.title = title
	}
	passedSeconds(): number {
		if (this.isRunning) {
			if (this.beginDate === undefined) {
				throw "BUG"
			}
			return this.offsetSeconds + (new Date().getTime() - new Date(this.beginDate).getTime()) / 1000
		}
		return this.offsetSeconds
	}
	reset() {
		this.offsetSeconds = 0
		this.beginDate = undefined
		this.isAboutToReset = false
		this.isAboutToDelete = false
		this.laps = []
	}
	serialize() {
		const { id, title, offsetSeconds, beginDate, isRunning, isFolded, isAboutToReset, isAboutToDelete, laps } = this
		return { id, title, offsetSeconds, beginDate, isRunning, isFolded, isAboutToReset, isAboutToDelete, laps: laps.map(o => o.serialize()) }
	}
	static deserialize(code: any) {
		const { id, title, offsetSeconds, beginDate, isRunning, isFolded, isAboutToReset, isAboutToDelete, laps } = code
		const o = new TimerState()
		o.id = id
		o.title = title
		o.offsetSeconds = offsetSeconds
		o.beginDate = beginDate
		o.isRunning = isRunning
		o.isFolded = isFolded
		o.isAboutToReset = isAboutToReset
		o.isAboutToDelete = isAboutToDelete
		o.laps = laps.map(o => LapState.deserialize(o))
		return o
	}
}
export type ROTimerState = Readonly<Pick<TimerState, "id" | "title" | "isAboutToDelete" | "isAboutToReset" | "isFolded" | "isRunning" | "passedSeconds"> & { laps: ROLapState[] }>
class State {
	timers: TimerState[] = []
	serialize() {
		const { timers } = this
		return { timers: timers.map(o => o.serialize()) }
	}
	static deserialize(code: any) {
		const { timers } = code
		const o = new State()
		o.timers = timers.map(o => TimerState.deserialize(o))
		return o
	}
}
export type ROState = Readonly<{ timers: ROTimerState[] }>

let state: State = new State() // initial state

export const getState = (): ROState => state
export const getJSON = () => JSON.stringify(state.serialize())
export const setJSON = bindAction((json: string) => state = State.deserialize(JSON.parse(json)))
export const actions = {
	timer(id: string) {
		const timer = state.timers.find(o => o.id === id)
		if (!timer) throw "BUG"
		return bindActions({
			start() {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.isRunning = true
				timer.beginDate = new Date().toISOString()
			},
			pause() {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.offsetSeconds = timer.passedSeconds()
				timer.beginDate = undefined
				timer.isRunning = false
			},
			addLap() {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.laps.push(new LapState(timer.passedSeconds()))
			},
			fold() {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.isFolded = true
			},
			unfold() {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.isFolded = false
			},
			resetAlert(visibility: boolean) {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.isAboutToReset = visibility
			},
			deleteAlert(visibility: boolean) {
				timer.isAboutToDelete = false
				timer.isAboutToReset = false
				timer.isAboutToDelete = visibility
			},
			setTitle(title: string) {
				timer.title = title
			},
			reset() {
				timer.isAboutToReset = false
				timer.reset()
			},
			delete() {
				timer.isAboutToDelete = false
				state.timers = state.timers.filter(o => o.id !== id)
			},
		})
	},
	lap(timerId: string, lapId: string) {
		const timer = state.timers.find(o => o.id === timerId)
		if (!timer) throw "BUG"
		return bindActions({
			delete() {
				timer.laps = timer.laps.filter(o => o.id !== lapId)
			},
		})
	},
	addTimer: bindAction(() => {
		state.timers.push(new TimerState())
	}),
}

type Listener = (state: ROState, action?: Action) => void
let listeners: Listener[] = []
export const subscribe = (listener: Listener) => {
	listeners.push(listener)
	return () => listeners = listeners.filter(o => o !== listener)
}
function onUpdate(action?: Action) {
	const fn = listeners.concat()
	fn.forEach(o => o(state, action))
}

type Action = (...args: any[]) => void
type Actions = {
	[name: string]: Action
}
function bindAction<T extends Action>(action: T): T {
	//@ts-ignore
	return (...args) => {
		action(...args)
		onUpdate(action)
	}
}
function bindActions<T extends Actions>(actions: T): T {
	let mapped: Partial<T> = {}
	for (let i in actions) {
		mapped[i] = bindAction(actions[i])
	}
	//@ts-ignore
	return mapped;
}

function uid(prefix = "id_"): string {
	let o = ""
	while (o.length < 8)
		o += Math.random().toString(36).slice(2, 6)
	return prefix + o.slice(0, 8)
}