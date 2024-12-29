'use strict';

import {LitElement, html, css} from 'lit';
//import {LitElement, html, css} from 'https://unpkg.com/lit@2.6.1/index.js?module';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
//import {unsafeHTML} from 'https://unpkg.com/lit@2.6.1/directives/unsafe-html.js?module';

import {formatAlbum, formatArtist, formatDuration, formatGenre, showMenuForSong, handleMenuItemSelect, toGDriveURL} from '../scripts/utils.js';

export class SongZSongList extends LitElement {
	
	RATING_INDICATORS = [
		html`<mwc-icon>thumb_down</mwc-icon><mwc-icon class="doubled-thumb-down">thumb_down</mwc-icon><mwc-icon class="tripled-thumb-down">thumb_down</mwc-icon>`,
		html`<mwc-icon>thumb_down</mwc-icon><mwc-icon class="doubled-thumb-down">thumb_down</mwc-icon>`,
		html`<mwc-icon>thumb_down_alt</mwc-icon>`,
		html`<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 13C20.6 13 21.1 13.2 21.5 13.6C21.8 14 22 14.5 22 15L14 18L7 16V7H8.9L16.2 9.7C16.7 9.9 17 10.3 17 10.8C17 11.1 16.9 11.4 16.7 11.6S16.1 12 15.8 12H13L11.2 11.3L10.9 12.2L13 13H20M1 7H5V18H1V7Z" /></svg>`,
		html`<mwc-icon>thumb_up_alt</mwc-icon>`,
		html`<mwc-icon>thumb_up</mwc-icon><mwc-icon class="doubled-thumb-up">thumb_up</mwc-icon>`,
		html`<mwc-icon>thumb_up</mwc-icon><mwc-icon class="doubled-thumb-up">thumb_up</mwc-icon><mwc-icon class="tripled-thumb-up">thumb_up</mwc-icon>`
	];
	songMenu;
	
	static get styles() {
		return css`
			:host a {
				color: currentColor;
				text-decoration: none;
			}
				:host a:hover,
				:host a:focus {
					text-decoration: underline;
				}
			table {
				border-spacing: 0;
			}
			td {
				padding-left: 0.125rem;
				padding-right: 0.125rem;
				cursor: default;
			}
			.album-art {
				width: 3em;
				height: 3em;
				margin-right: 0.25rem;
				margin-top: -0.25rem;
				margin-bottom: -0.25rem;
			}
			.rating {
				white-space: nowrap;
			}
			.doubled-thumb-down,
			.doubled-thumb-up,
			.tripled-thumb-down,
			.tripled-thumb-up {
				margin-left: -1em;
				-webkit-text-stroke: 0.125rem var(--background-color);
			}
			.doubled-thumb-down {
				transform: translate(0.15rem, -0.0375rem) scale(0.75);
			}
			.doubled-thumb-up {
				transform: translate(-0.15rem, 0.0375rem) scale(0.75);
			}
			.tripled-thumb-down {
				transform: translate(0.25rem, -0.09rem) scale(0.5);
			}
			.tripled-thumb-up {
				transform: translate(-0.25rem, 0.09rem) scale(0.5);
			}
		`;
	}
	
	static get properties() {
		return {
			viewtype: { type: String, reflect: true }, /* album, artist, composer, genre, playlist, wrapped, null */
			songs: { type: Array, attribute: false }
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
	 * Open the menu next to a song when its menu button is selected.
	 * @param {MouseEvent} ev
	 */
	handleMenuButton(ev) {
		var index = parseInt(ev.currentTarget.parentElement.parentElement.dataset.index),
			song = this.songs[index];
		showMenuForSong(ev, this.songMenu, song, index);
	}
	
	/**
	 * Send an event from the song list in response to a song menu item being selected.
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
		ev.preventDefault();
		this.dispatchEvent(new CustomEvent('play-song-now', {
			detail: {
				list: this.songs,
				index: parseInt(ev.currentTarget.parentElement.dataset.index)
			},
			bubbles: true,
			composed: true
		}));
	}
	
	/**
	 * @override
	 */
	render() {
		const SHOW_ART = (this.viewtype !== 'album'),
			SHOW_ACTIONS = (this.viewtype !== 'wrapped');
		return html`
			<table>
				<thead>
					<tr>
						${this.viewtype === 'album' ? html`<th title="Track number">#</th>` : ''}
						${this.viewtype === 'playlist' ? html`<th title="List index">#</th>` : ''}
						${this.viewtype === 'wrapped' ? html`<th title="Ranking">#</th>` : ''}
						${SHOW_ART ? html`<th></th>` : ''}
						<th colspan="${SHOW_ACTIONS ? 2 : 1}">Title</th>
						${this.viewtype !== 'wrapped' ? html`<th><mwc-icon title="Duration">schedule</mwc-icon></th>` : ''}
						${this.viewtype !== 'album' ? html`<th>Album</th>` : ''}
						${this.viewtype !== 'artist' ? html`<th>Artist</th>` : ''}
						${this.viewtype !== 'composer' && this.viewtype !== 'wrapped' ? html`<th>Composer</th>` : ''}
						${this.viewtype !== 'genre' && this.viewtype !== 'wrapped' ? html `<th>Genre</th>` : ''}
						<th><mwc-icon title="Playthroughs" aria-label="Playthroughs">music_note</mwc-icon></th>
						${this.viewtype !== 'wrapped' ? html`<th><mwc-icon title="Rating" aria-label="Rating">thumbs_up_down</mwc-icon></th>` : ''}
					</tr>
				</thead>
				<tbody>
					${(this.songs || []).map((song, i) => html`
						<tr data-index="${i}">
							${this.viewtype === 'album' ? html`<td class="index">${song.trackNo}</td>` : ''}
							${this.viewtype === 'playlist' ? html`<td class="index">${song.listIndex + 1}</td>` : ''}
							${this.viewtype === 'wrapped' ? html`<td class="index">${i + 1}</td>` : ''}
							${SHOW_ART ? html`<td><img class="album-art" src="${song.gDriveArt ? toGDriveURL(song.gDriveArt) : '/images/unknown_album.svg'}" alt="" /></td>` : ''}
							<td class="title" title="${song.title}" @dblclick="${this.handleDblClick}">${song.title}</td>
							${SHOW_ACTIONS ? html`<td><mwc-icon-button slot="meta" icon="more_vert" @click=${this.handleMenuButton}></mwc-icon-button></td>` : ''}
							${this.viewtype !== 'wrapped' ? html`<td class="duration">${formatDuration(song.duration / 1000)}</td>` : ''}
							${this.viewtype !== 'album' ? html`<td class="album" title="${formatAlbum(song, true)}">${unsafeHTML(formatAlbum(song))}</td>` : ''}
							${this.viewtype !== 'artist' ? html`<td class="artist" title="${formatArtist(song, true)}">${unsafeHTML(formatArtist(song, false))}</td>` : ''}
							${(this.viewtype !== 'composer' && this.viewtype !== 'wrapped') ? html`<td title="${formatArtist(song, true, true)}">${unsafeHTML(formatArtist(song, false, true))}</td>` : ''}
							${this.viewtype !== 'genre' && this.viewtype !== 'wrapped' ? html`<td>${unsafeHTML(formatGenre(song))}</td>` : ''}
							<td class="playthroughs">${song.playthroughs ?? ''}</td>
							${this.viewtype !== 'wrapped' ? html`<td class="rating">${
								(typeof song.rating === 'undefined') ? '' : this.RATING_INDICATORS[song.rating + 3]
							}</td>` : ''}
						</tr>
					`)}
				</tbody>
			</table>
			<songz-song-context-menu viewtype="${this.viewtype}" @action="${this.handleMenuItemSelect}"></songz-song-context-menu>
		`;
	}
}

window.customElements.define('songz-song-list', SongZSongList);
