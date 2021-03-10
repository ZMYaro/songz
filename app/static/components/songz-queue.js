'use strict';

//import {LitElement, html, css, unsafeCSS}, css from 'lit-element';
import {LitElement, html, css, unsafeCSS} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@material/mwc-icon';
import 'https://unpkg.com/@material/mwc-icon@0.20.0/mwc-icon.js?module';
//import '@material/mwc-icon-button';
import 'https://unpkg.com/@material/mwc-icon-button@0.20.0/mwc-icon-button.js?module';
//import '@material/mwc-list';
//import '@material/mwc-list/mwc-list-item';
import 'https://unpkg.com/@material/mwc-list@0.20.0/mwc-list.js?module';
import 'https://unpkg.com/@material/mwc-list@0.20.0/mwc-list-item.js?module';
//import '@material/mwc-menu';
import 'https://unpkg.com/@material/mwc-menu@0.20.0/mwc-menu.js?module';

import {formatArtist, formatDuration, toGDriveURL} from '../scripts/utils.js';

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
		ev.stopPropagation();
		// Tell the menu which song it is open for.
		this.songMenu.dataset.index = ev.currentTarget.parentElement.dataset.index;
		// Open the menu from the button.
		this.songMenu.anchor = ev.currentTarget;
		this.songMenu.show();
	}
	
	/**
	 * Send an event from the queue in response to a song menu item being clicked.
	 * @param {MouseEvent} ev
	 */
	handleMenuItemSelect(ev) {
		// Get the action and song index recorded in data attributes.
		var action = ev.currentTarget.dataset.action,
			index = parseInt(ev.currentTarget.parentElement.dataset.index);
		// Send them to the app as an event from the component.
		this.dispatchEvent(new CustomEvent(action, {
			detail: index
		}));
	}
	
	/**
	 * Play a song when it is double-clicked.
	 * @param {MouseEvent} ev
	 */
	handleDblClick(ev) {
		this.dispatchEvent(new CustomEvent('queue-play-now', {
			detail: ev.currentTarget.dataset.index
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
			<mwc-menu fixed wrapFocus>
				<mwc-list-item graphic="icon" data-action="queue-play-now" @click=${this.handleMenuItemSelect}>
					<mwc-icon slot="graphic">play_arrow</mwc-icon>
					Play
				</mwc-list-item>
				<mwc-list-item graphic="icon" data-action="queue-play-next" @click=${this.handleMenuItemSelect}>
					<mwc-icon slot="graphic">playlist_play</mwc-icon>
					Play next
				</mwc-list-item>
				<mwc-list-item graphic="icon" data-action="queue-remove" @click=${this.handleMenuItemSelect}>
					<mwc-icon slot="graphic">remove_circle</mwc-icon>
					Remove from queue
				</mwc-list-item>
				<li divider role="separator"></li>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">playlist_add</mwc-icon>
					Add to playlist
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">album</mwc-icon>
					Go to album
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">person</mwc-icon>
					<!--<mwc-icon slot="graphic">account_music</mwc-icon>-->
					Go to artist
				</mwc-list-item>
			</mwc-menu>
		`;
	}
}

window.customElements.define('songz-queue', SongZQueue);
