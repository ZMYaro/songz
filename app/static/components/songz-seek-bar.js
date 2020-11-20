'use strict';

//import {LitElement, html, css, unsafeCSS} from 'lit-element';
import {LitElement, html, css, unsafeCSS} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

import {NARROW_WINDOW_THRESHOLD} from '../scripts/constants.js';

export class SongZSeekBar extends LitElement {
	
	playing = false;
	
	static get styles() {
		return css`
			:host {
				display: flex;
				align-items: center;
				width: 100%;
				padding: 0 0.25em;
				margin: -0.5em 0 -1em;
				
				font-size: 0.5rem;
			}
			input[type="range"] {
				flex-grow: 1;
			}
			@media (min-width: ${unsafeCSS(`${NARROW_WINDOW_THRESHOLD}px`)}) {
				:host {
					font-size: 0.75rem;
				}
			}
		`;
	}
	
	static get properties() {
		return {
			currentTime: { type: Number, reflect: true },
			duration: { type: Number, reflect: true }
		}
	}
	
	formatTime(time) {
		if (isNaN(time)) {
			return '\u2212\u2212:\u2212\u2212';
		}
		var minutes = Math.floor(time / 60),
			seconds = Math.floor(time - (minutes * 60));
		if (seconds < 10) {
			seconds = '0' + seconds;
		}
		return (minutes + ':' + seconds);
	}
	
	sendSeek(ev) {
		this.currentTime = ev.currentTarget.value;
		this.dispatchEvent(new CustomEvent('seek'), {
			bubbles: true,
			composed: true
		});
	}
	
	render() {
		return html`
			${this.formatTime(this.currentTime)}
			${!this.duration ?
				html`<input type="range" value="0" disabled />` :
				html`<input type="range" step="0.5" min="0" max="${this.duration}" value="${this.currentTime}" @input="${this.sendSeek}" />`
			}
			${this.formatTime(this.duration)}
		`;
	}
}

window.customElements.define('songz-seek-bar', SongZSeekBar);
