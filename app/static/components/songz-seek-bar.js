'use strict';

import {LitElement, html, css, unsafeCSS} from 'lit';
//import {LitElement, html, css, unsafeCSS} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {NARROW_WINDOW_THRESHOLD} from '../scripts/constants.js';
import {formatDuration} from '../scripts/utils.js';

export class SongZSeekBar extends LitElement {
	
	playing = false;
	
	static get styles() {
		return css`
			:host {
				box-sizing: border-box;
				display: flex;
				align-items: center;
				width: 100%;
				padding: 0 0.25em;
				
				font-size: 0.5rem;
			}
			input[type="range"] {
				margin: 1px 2px;
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
	
	/**
	 * Send an event when the seek bar is moved.
	 * @param {Event} ev
	 */
	sendSeek(ev) {
		this.currentTime = ev.currentTarget.value;
		this.dispatchEvent(new CustomEvent('seek'), {
			bubbles: true,
			composed: true
		});
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			${formatDuration(this.currentTime)}
			${!this.duration ?
				html`<input type="range" value="0" disabled />` :
				html`<input type="range" step="0.5" min="0" max="${this.duration}" .value="${this.currentTime}" @input="${this.sendSeek}" />`
			}
			${formatDuration(this.duration)}
		`;
	}
}

window.customElements.define('songz-seek-bar', SongZSeekBar);
