import { html } from "lit-html";
import { live } from "lit-html/directives/live";
import { AppState, LapState, RemoveAlertState, ResetAlertState, TimerState } from "./store";

const icon = (name: string) => html`<code class="icon ${name}"></code>`

export const app = (o: AppState) => html`
<div id="app" @scroll=${o.onScroll}>
	<div id="header">
		<h1 class="bold-title ${o.landing ? " invisible" : ""}">Listy Timer</h1>
		<button class="btn -text" @click=${o.addTimer}>${icon("plus")}</button>
	</div>
	<div id="timers">
		<div class="place-holder ${o.landing ? "" : " invisible"}">
			<h2 class="title">Listy Timer</h2>
			<div>Run multiple stopwatches at the same time.</div>
			<br>
			<br>
			<div>
				Press ${icon("plus")} in the header to add a new timer.<br>
				Scroll down to see the added timers.<br>
				Try things out to learn how to use this app.
			</div>
			<div class="spacer"></div>
		</div>
		<ul>
			${o.timers.map(o => timer(o))}
		</ul>
		<div class="place-holder-bottom">
			<div class="end-of-content"></div>
			<div class="spacer"></div>
			<div class="made-by">
				<p>Made by <a href="https://github.com/omasakun" rel="noreferrer" class="link">omasakun</a></p>
			</div>
			<div class="reset-app">
				<button class="btn -text" @click=${o.reset}>Reset App</button>
			</div>
		</div>
	</div>
</div>
`;
const timer = (o: TimerState) => html`
<li @dragover=${o.dragover} @drop=${o.drop}>
	<div class="one-line" @dragstart=${o.dragstart} @click=${o.toggleFold} draggable="true">
		<div class="duration mono">${o.duration}</div>
		<div class="duration-lap mono">${o.lapDuration}</div>
		<div class="timer-title">${o.title}</div>
		${o.isRunning ?
		html`<button class="btn -text start-stop" @click=${o.pause}>${icon("pause-circle")}</button>` :
		html`<button class="btn -text start-stop" @click=${o.start}>${icon("play-circle")}</button>`
		}
		${o.isRunning ?
		html`<button class="btn -text lap-reset" @click=${o.addLap}>${icon("plus-circle")}</button>` :
		html`<button class="btn -text lap-reset" @click=${o.showResetAlert}>${icon("refresh")}</button>`
		}
	</div>
	${o.isFolded ? "" : html`
	<div class="full">
		<div class="title-input-container">
			<div class="text_field">
				<input type="text" placeholder="Title" id=${o.inputId} .value=${live(o.title)} @input=${o.setTitle}>
				<label for=${o.inputId}>Title</label>
			</div>
		</div>
		<div class="lap-list">
			<ol>
				${o.laps.map(o => lap(o))}
			</ol>
		</div>
		<button class="btn delete-timer" @click=${o.showRemoveAlert}>${icon("trash")}<span>Remove Timer</span></button>
	</div>
	`}
	${o.isAboutToDelete ? removeAlert(o.removeAlert) : ""}
	${o.isAboutToReset ? resetAlert(o.resetAlert) : ""}
</li>
`;
const lap = (o: LapState) => html`
<li>
	<div class="lap-index mono">${o.index}</div>
	<div class="total-duration mono">${o.totalDuration}</div>
	<div class="self-duration mono">${o.selfDuration}</div>
	<button class="btn -text lap-remove" @click=${o.remove}>${icon("close-square")}</button>
</li>
`;
const resetAlert = (o: ResetAlertState) => html`
<div class="alert -danger">
	<div class="alert-body">Do you really want to reset the timer?</div>
	<div class="buttons">
		<button class="btn alert-yes" @click=${o.yes}>Yes</button>
		<button class="btn alert-no -text" @click=${o.cancel}>Cancel</button>
	</div>
</div>
`;
const removeAlert = (o: RemoveAlertState) => html`
<div class="alert -danger">
	<div class="alert-body">Do you really want to delete the timer?</div>
	<div class="buttons">
		<button class="btn alert-yes" @click=${o.yes}>Yes</button>
		<button class="btn alert-no -text" @click=${o.cancel}>Cancel</button>
	</div>
</div>
`;
