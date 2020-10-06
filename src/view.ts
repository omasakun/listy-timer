import { html } from "lit-html";
import { actions, getState, ROLapState, ROTimerState } from "./store";

export const app = () => html`
	<div id="app">
		<div id="header">
			<h1 class="bold-title">Listy Timer</h1>
			<button class="btn -text" @click=${actions.addTimer}><code class="icon plus"></code></button>
		</div>
		<div id="timers">
			<div class="place-holder">
				<h2 class="title">Listy Timer</h2>
				<div>Run multiple stopwatches at the same time.</div>
				<br>
				<br>
				<div>
					Press <code class="icon plus">Add</code> in the header to add a new timer.<br>
					Scroll down to see the added timers.<br>
					Try things out to learn how to use this app.
				</div>
				<div class="spacer"></div>
			</div>
			<ul>
				${getState().timers.map(o=>timer_item(o))}
			</ul>
			<div class="place-holder-bottom">
				<div class="end-of-content"></div>
				<div class="spacer"></div>
				<div class="made-by">
					<p>Made by <a href="https://github.com/omasakun" rel="noreferrer" class="link">omasakun</a>
					</p>
				</div>
				<div class="reset-app">
					<button class="btn -text" @click=${() => {
						if(confirm("Do you really want to reset the app? This action cannot be undone.")){
							localStorage.removeItem("persist_store");
							location.reload();
						}
					}}>Reset App</button>
				</div>
			</div>
		</div>
	</div>
`
const timer_item = (timer: ROTimerState) => html`
	<li>
		<div class="one-line">
			<div class="duration mono">${timeString(timer.passedSeconds())}</div>
			<div class="duration-lap mono">
				${
					timeString(timer.laps.length === 0 ? 
						timer.passedSeconds() : 
						timer.passedSeconds() - timer.laps[timer.laps.length-1].offsetSeconds)
				}
			</div>
			<div class="timer-title">${timer.title}</div>
			${
				timer.isRunning ?
				html`<button class="btn -text start-stop" @click=${actions.timer(timer.id).pause}><code class="icon pause-circle">Pause</code></button>` :
				html`<button class="btn -text start-stop" @click=${actions.timer(timer.id).start}><code class="icon play-circle">Start</code></button>`
			}
			${
				timer.isRunning ?
				html`<button class="btn -text lap-reset" @click=${actions.timer(timer.id).addLap}><code class="icon plus-circle">Lap</code></button>` :
				html`<button class="btn -text lap-reset" @click=${()=>actions.timer(timer.id).resetAlert(true)}><code class="icon refresh">Reset</code></button>`
			}
			${
				timer.isFolded ?
				html`<button class="btn -text fold-unfold" @click=${actions.timer(timer.id).unfold}><code class="icon arrow-down">Unfold</code></button>` :
				html`<button class="btn -text fold-unfold" @click=${actions.timer(timer.id).fold}><code class="icon arrow-up">Fold</code></button>`
			}
		</div>
		${ timer.isFolded ? "" : html`
			<div class="full">
				<div class="title-input-container">
					<div class="text_field">
						<input type="text" placeholder="Title" id=${"timer-title-input-"+timer.id} .value=${timer.title} @input=${e=>actions.timer(timer.id).setTitle(e.target.value)}>
						<label for=${"timer-title-input-"+timer.id}>Title</label>
					</div>
				</div>
				<div class="lap-list">
					<ol>
						${timer.laps.map((o,i)=>lap_item(timer,o,i))}
					</ol>
				</div>
				<button class="btn delete-timer" @click=${()=>actions.timer(timer.id).deleteAlert(true)}><code class="icon trash"></code><span>Delete Timer</span></button>
			</div>
			`
		}
		${!timer.isAboutToDelete?"":delete_alert(timer)}
		${!timer.isAboutToReset?"":reset_alert(timer)}
	</li>
`;
const lap_item = (timer: ROTimerState, lap:ROLapState, index: number) => html`
	<li>
		<div class="lap-index mono">#
			${(index + 1).toString().padStart(2, "0")}
		</div>
		<div class="self-duration mono">
			${timeString(lap.offsetSeconds)}
		</div>
		<div class="total-duration mono">
			${timeString(index === 0 ? lap.offsetSeconds : (lap.offsetSeconds - timer.laps[index - 1].offsetSeconds))}
		</div>
		<button class="btn -text lap-remove" @click=${actions.lap(timer.id,lap.id).delete}><code class="icon close-square">Remove</code></button>
	</li>
`;
const reset_alert = (timer: ROTimerState) => html`
	<div class="alert -danger">
		<div class="alert-body">Do you really want to reset the timer?</div>
		<div class="buttons">
			<button class="btn alert-yes" @click=${actions.timer(timer.id).reset}>Yes</button>
			<button class="btn alert-no -text" @click=${()=>actions.timer(timer.id).resetAlert(false)}>Cancel</button>
		</div>
	</div>
`;
const delete_alert = (timer: ROTimerState) => html`
	<div class="alert -danger">
		<div class="alert-body">Do you really want to delete the timer?</div>
		<div class="buttons">
			<button class="btn alert-yes" @click=${actions.timer(timer.id).delete}>Yes</button>
			<button class="btn alert-no -text" @click=${()=>actions.timer(timer.id).deleteAlert(false)}>Cancel</button>
		</div>
	</div>
`;

function timeString(seconds: number) {
	const s = Math.floor(seconds % 60)
	const m = Math.floor(seconds / 60)
	return m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0")
}