'use strict';

//import {LitElement, html, css, unsafeCSS} from 'lit-element';
import {LitElement, html, css, unsafeCSS} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@material/mwc-fab';
import 'https://unpkg.com/@material/mwc-fab@0.19.1/mwc-fab.js?module';
//import '@material/mwc-icon-button';
import 'https://unpkg.com/@material/mwc-icon-button@0.19.1/mwc-icon-button.js?module';

import './songz-seek-bar.js';
import {NARROW_WINDOW_THRESHOLD} from '../scripts/constants.js';

export class SongZPlayer extends LitElement {
	
	boundNarrowWindowCheck = this.checkNarrowWindow.bind(this);
	
	static get styles() {
		return css`
			:host {
				display: flex;
				justify-content: space-between;
				align-items: center;
				flex-wrap: wrap;
				height: 64px;
				
				box-shadow: rgba(0, 0, 0, 0.2) 0 8px 17px 0, rgba(0, 0, 0, 0.19) 0 6px 20px 0;
				z-index: 2;
			}
			@media (min-width: ${unsafeCSS(`${NARROW_WINDOW_THRESHOLD}px`)}) {
				:host {
					height: 96px;
				}
			}
			.controls {
				display: flex;
				align-items: center;
			}
		`;
	}
	
	static get properties() {
		return {
			status: { type: String, reflect: true },
			currentTime: { type: Number, reflect: true },
			duration: { type: Number, reflect: true },
			narrowWindow: { type: Boolean, attribute: false }
		};
	}
	
	/**
	 * @override
	 */
	connectedCallback() {
		super.connectedCallback();
		this.checkNarrowWindow();
		window.addEventListener('resize', this.boundNarrowWindowCheck);
	}
	
	/**
	 * @override
	 */
	disconnectedCallback() {
		window.removeEventListener('resize', this.boundNarrowWindowCheck);
		super.disconnectedCallback();
	}
	
	/**
	 * Check whether the window is narrow (e.g. a mobile device).
	 * This is needed beacuse the MWC FAB size cannot be set by media query.
	 */
	checkNarrowWindow() {
		this.narrowWindow = (window.innerWidth < NARROW_WINDOW_THRESHOLD);
	}
	
	sendPrevious() {
		this.dispatchEvent(new CustomEvent('previous'));
	}
	sendStepBackward() {
		this.dispatchEvent(new CustomEvent('stepbackward'));
	}
	sendPlayPause() {
		this.dispatchEvent(new CustomEvent('playpause'));
	}
	sendStepForward() {
		this.dispatchEvent(new CustomEvent('stepforward'));
	}
	sendNext() {
		this.dispatchEvent(new CustomEvent('next'));
	}
	sendSeek(ev) {
		this.currentTime = ev.currentTarget.currentTime;
		this.dispatchEvent(new CustomEvent('seek'), {
			bubbles: true,
			composed: true
		});
	}
	
	render() {
		return html`
			<songz-seek-bar
				currenttime="${this.currentTime}"
				duration="${this.duration}"
				@seek="${this.sendSeek}">
			</songz-seek-bar>
			<div><!-- TODO: Song metadata --></div>
			<div class="controls">
				<mwc-icon-button icon="skip_previous" @click="${this.sendPrevious}"></mwc-icon-button>
				<mwc-icon-button icon="replay_10" @click="${this.sendStepBackward}"></mwc-icon-button>
				<mwc-fab
					?mini=${this.narrowWindow}
					icon="${this.status === 'buffering' ? 'refresh' :
						this.status === 'playing' ? 'pause' :
						'play_arrow'}"
					@click="${this.sendPlayPause}">
				</mwc-fab>
				<mwc-icon-button icon="forward_10" @click="${this.sendStepForward}"></mwc-icon-button>
				<mwc-icon-button icon="skip_next" @click="${this.sendNext}"></mwc-icon-button>
			</div>
			<div><!-- TODO: right-side controls --></div>
		`;
	}
}

window.customElements.define('songz-player', SongZPlayer);
