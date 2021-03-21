'use strict';

//import {LitElement, html, css, unsafeCSS}, css from 'lit-element';
import {LitElement, html, css, unsafeCSS} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

import {formatArtist, formatDuration, toGDriveURL, handleMenuButton, handleMenuItemSelect} from '../scripts/utils.js';

export class SongZQueue extends LitElement {
	
	songMenu = undefined;
	
	static get styles() {
		return css`
			:host {
				/* Position within the Polymer app-drawer. */
				position: absolute;
				left: 0;
				right: 0;
				top: 48px;
				bottom: 0;
				overflow-y: auto;
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
		this.songMenu = this.shadowRoot.querySelector('mwc-menu');
	}
	
	/**
	 * Open the menu next to a song when its menu button is clicked.
	 * @param {MouseEvent} ev
	 */
	handleMenuButton(ev) {
		// Tell the menu which song it is open for.
		this.songMenu.dataset.index = ev.currentTarget.parentElement.dataset.index;
		
		handleMenuButton(ev, this.songMenu);
	}
	
	/**
	 * Send an event from the queue in response to a song menu item being clicked.
	 * @param {CustomEvent} ev - The onselected event from the menu
	 */
	handleMenuItemSelect(ev) {
		handleMenuItemSelect(ev, this);
	}
	
	/**
	 * Play a song when it is double-clicked.
	 * @param {MouseEvent} ev
	 */
	handleDblClick(ev) {
		this.dispatchEvent(new CustomEvent('queue-play-now', {
			detail: parseInt(ev.currentTarget.dataset.index)
		}));
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-list class="queue-list">
				${(this.songs || []).map((song, i) => html`
					<mwc-list-item graphic="small" hasMeta class="${i === this.activeIndex ? 'current' : ''}" data-index="${i}" @dblclick="${this.handleDblClick}">
						<img slot="graphic" class="album-art" src="${song.gDriveArt ? toGDriveURL(song.gDriveArt) : '/images/unknown_album.svg'}" alt="" />
						<span class="song-title">${song.title}</span>
						<span class="artist">${formatDuration(song.duration / 1000)} &middot; ${formatArtist(song, true)}</span>
						<mwc-icon-button slot="meta" icon="more_vert" @click=${this.handleMenuButton}></mwc-icon-button>
					</mwc-list-item>
				`)}
			</mwc-list>
			<mwc-menu fixed wrapFocus @action="${this.handleMenuItemSelect}">
				<mwc-list-item graphic="icon" value="queue-play-now">
					<mwc-icon slot="graphic">play_arrow</mwc-icon>
					Play
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="queue-play-next">
					<mwc-icon slot="graphic">playlist_play</mwc-icon>
					Play next
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="queue-remove">
					<mwc-icon slot="graphic">remove_circle</mwc-icon>
					Remove from queue
				</mwc-list-item>
				<li divider role="separator"></li>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">playlist_add</mwc-icon>
					Add to playlist
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="open-album">
					<mwc-icon slot="graphic">album</mwc-icon>
					Go to album
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="open-artist">
					<mwc-icon slot="graphic">person</mwc-icon>
					<!--<mwc-icon slot="graphic">account_music</mwc-icon>-->
					Go to artist
				</mwc-list-item>
			</mwc-menu>
		`;
	}
}

window.customElements.define('songz-queue', SongZQueue);
