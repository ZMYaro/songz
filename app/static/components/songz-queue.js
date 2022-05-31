'use strict';

//import {LitElement, html, css}, css from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {formatArtist, formatDuration, toGDriveURL, showMenuForSong, handleMenuItemSelect} from '../scripts/utils.js';

export class SongZQueue extends LitElement {
	
	songMenu;
	
	static get styles() {
		return css`
			:host {
				overflow-y: auto;
				--mdc-list-vertical-padding: 0;
			}
			.queue-list mwc-list-item {
				padding-left: 0;
				padding-right: 0;
			}
				.queue-list mwc-list-item.current {
					font-weight: bold;
				}
			.album-art {
				width: 3em;
				height: 3em;
				margin-right: 0.25em;
			}
			/* IDK why the text starts floating out to the right in some of these mwc-list-items, but this fixes that. */
			.song-title {
				display: block;
				text-align: left;
			}
			/* Mimic the secondary slot without making it an actual two-line mwc-list-item. */
			.artist {
				display: block;
				text-align: left;
				margin-top: -0.25em;
				font-size: var(--mdc-typography-body2-font-size, 0.875rem);
				font-weight: var(--mdc-typography-body2-font-weight, 400);
				color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54));
			}
			/* Fix MWC icon button in meta slot being messed up for some reason. */
			mwc-list-item mwc-icon-button[slot="meta"] {
				margin-top: -1em;
				margin-left: -1.5em;
				margin-right: 1.5em;
			}
		`;
	}
	
	static get properties() {
		return {
			songs: { type: Array, attribute: false },
			activeIndex: { type: Number, attribute: true }
		};
	}
	
	/**
	 * @override
	 * Get a reference to the song menu when the element is first updated.
	 */
	firstUpdated() {
		this.songMenu = this.shadowRoot.querySelector('songz-song-context-menu');
	}
	
	/**
	 * Open the menu next to a song when its menu button is clicked.
	 * @param {MouseEvent} ev
	 */
	handleMenuButton(ev) {
		var index = parseInt(ev.currentTarget.parentElement.dataset.index),
			song = this.songs[index];
		showMenuForSong(ev, this.songMenu, song, index);
	}
	
	/**
	 * Send an event from the queue in response to a song menu item being clicked.
	 * @param {CustomEvent} ev - The onselected event from the menu
	 */
	handleMenuItemSelect(ev) {
		handleMenuItemSelect(ev, this.songs, this);
	}
	
	/**
	 * Play a song when it is double-clicked.
	 * @param {MouseEvent} ev
	 */
	handleDblClick(ev) {
		this.dispatchEvent(new CustomEvent('queue-play-now', {
			detail: {
				list: this.songs,
				index: parseInt(ev.currentTarget.dataset.index)
			},
			bubbles: true,
			composed: true
		}));
	}
	
	/**
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.requestUpdate();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-list class="queue-list">
				${(this.songs || []).length === 0 ?
					html`<p style="text-align: center;">No songs in queue.</p>` :
					(this.songs || []).map((song, i) => html`
						<mwc-list-item graphic="small" hasMeta class="${i === this.activeIndex ? 'current' : ''}" data-index="${i}" @dblclick="${this.handleDblClick}">
							<img slot="graphic" class="album-art" src="${song.gDriveArt ? toGDriveURL(song.gDriveArt) : '/images/unknown_album.svg'}" alt="" />
							<span class="song-title">${song.title}</span>
							<span class="artist">${formatDuration(song.duration / 1000)} &middot; ${formatArtist(song, true)}</span>
							<mwc-icon-button slot="meta" icon="more_vert" @click=${this.handleMenuButton}></mwc-icon-button>
						</mwc-list-item>
					`)
				}
			</mwc-list>
			<songz-song-context-menu viewtype="queue" @action="${this.handleMenuItemSelect}"></songz-song-context-menu>
		`;
	}
}

window.customElements.define('songz-queue', SongZQueue);
