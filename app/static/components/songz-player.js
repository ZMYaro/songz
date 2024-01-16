'use strict';

import {LitElement, html, css, unsafeCSS} from 'lit';
//import {LitElement, html, css, unsafeCSS} from 'https://unpkg.com/lit@2.6.1/index.js?module';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
//import {unsafeHTML} from 'https://unpkg.com/lit@2.6.1/directives/unsafe-html.js?module';

import {NARROW_WINDOW_THRESHOLD} from '../scripts/constants.js';
import {formatAlbum, formatArtist} from '../scripts/utils.js';
import { getFileURL } from '../scripts/gapi_utils.js';

export class SongZPlayer extends LitElement {
	
	boundNarrowWindowCheck = this.checkNarrowWindow.bind(this);
	
	static get styles() {
		return css`
			:host {
				flex-shrink: 0;
				
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				height: var(--player-height);
				overflow: hidden;
				
				background-color: var(--mdc-theme-surface, #fff);
				box-shadow: rgba(0, 0, 0, 0.2) 0 8px 17px 0, rgba(0, 0, 0, 0.19) 0 6px 20px 0;
				z-index: 2;
			}
			.bottom-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				
				width: 100%;
				height: calc(100% - 20px);
				flex-grow: 1;
			}
			.scrollable-region {
				display: flex;
				overflow-x: auto;
				overflow-y: hidden;
				scroll-snap-type: x mandatory;
				
				flex-grow: 1;
				height: 100%;
			}
				.scrollable-region > div {
					width: 100%;
					height: 100%;
					flex-shrink: 0;
					scroll-snap-align: start;
					scroll-snap-stop: always;
				}
			.album-art,
			.album-art > img {
				height: 100%;
				aspect-ratio: 1 / 1;
			}
			.song-details {
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				align-items: start;
				justify-content: center;
				padding: 0 8px;
			}
				.song-details .artist {
					font-size: var(--mdc-typography-body2-font-size, 0.875rem);
					color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
				}
				.song-details a {
					color: inherit;
					text-decoration: none;
				}
					.song-details a:hover,
					.song-details a:focus {
						text-decoration: underline;
					}
			.play-controls {
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.queue-toggle {
				background-color: var(--mdc-theme-surface, #fff);
			}
			@media (min-width: ${unsafeCSS(`${NARROW_WINDOW_THRESHOLD}px`)}) {
				.scrollable-region {
					justify-content: space-between;
				}
					.scrollable-region > div {
						width: auto;
						flex-shrink: 1;
					}
				div.play-controls {
					width: var(--app-drawer-width);
				}
				.queue-toggle {
					display: none;
				}
			}
			mwc-fab.spin {
				animation: spin 1s linear infinite;
			}
			@keyframes spin {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}
		`;
	}
	
	static get properties() {
		return {
			status: { type: String, reflect: true },
			currentTime: { type: Number, reflect: true },
			duration: { type: Number, reflect: true },
			song: { type: Object, attribute: false },
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
	/**
	 * Send an event when the seek bar is moved.
	 * @param {Event} ev
	 */
	sendSeek(ev) {
		this.currentTime = ev.currentTarget.currentTime;
		this.dispatchEvent(new CustomEvent('seek'), {
			bubbles: true,
			composed: true
		});
	}
	sendOpenQueue() {
		this.dispatchEvent(new CustomEvent('toggle-queue'));
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-seek-bar
				currenttime="${this.currentTime}"
				duration="${this.duration}"
				@seek="${this.sendSeek}">
			</songz-seek-bar>
			<div class="bottom-row">
				${this.song?.album ?
					html`<a href="${'#albums/' + this.song.album._id}" class="album-art">
						<img
							src="${this.song?.gDriveArt ? getFileURL(this.song.gDriveArt, this) : '/images/unknown_album.svg'}"
							alt="${this.song.album.title + ' album cover.'}"
							title="${this.song.album.title}" />
					</a>` :
					html`<a class="album-art">
						<img src="/images/unknown_album.svg" alt="" />
					</a>`
				}
				<div class="scrollable-region">
					<div class="song-details">
						${this.song?.title || ''}
						<span class="artist">${unsafeHTML(formatArtist(this.song))}</span>
					</div>
					<div class="play-controls">
						<mwc-icon-button icon="skip_previous" title="Previous song" @click="${this.sendPrevious}"></mwc-icon-button>
						<mwc-icon-button icon="replay_10" title="Back 10 seconds" @click="${this.sendStepBackward}"></mwc-icon-button>
						<mwc-fab
							?mini=${this.narrowWindow}
							icon="${this.status === 'buffering' ? 'refresh' :
								this.status === 'playing' ? 'pause' :
								'play_arrow'}"
							title="${this.status === 'buffering' ? 'Buffering' :
								this.status === 'playing' ? 'Pause' :
								'Play'}"
							class="${this.status === 'buffering' ? 'spin' : ''}"
							@click="${this.sendPlayPause}">
						</mwc-fab>
						<mwc-icon-button icon="forward_10" title="Forward 10 seconds" @click="${this.sendStepForward}"></mwc-icon-button>
						<mwc-icon-button icon="skip_next" title="Next song" @click="${this.sendNext}"></mwc-icon-button>
					</div>
				</div>
				<div class="queue-toggle">
					<mwc-icon-button icon="queue_music" @click="${this.sendOpenQueue}"></mwc-icon-button>
				</div>
			</div>
		`;
	}
}

window.customElements.define('songz-player', SongZPlayer);
