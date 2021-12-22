'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';
//import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import {unsafeHTML} from 'https://unpkg.com/lit-html@1.4.1/directives/unsafe-html.js?module';

import {formatAlbum, formatArtist, formatDuration, handleMenuButton, handleMenuItemSelect, toGDriveURL} from '../scripts/utils.js';

export class SongZSongList extends LitElement {
	
	RATING_INDICATORS = [
		html`<mwc-icon>thumb_down</mwc-icon><mwc-icon class="doubled-thumb-down">thumb_down</mwc-icon>`,
		html`<mwc-icon>thumb_down_alt</mwc-icon>`,
		html`<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 13C20.6 13 21.1 13.2 21.5 13.6C21.8 14 22 14.5 22 15L14 18L7 16V7H8.9L16.2 9.7C16.7 9.9 17 10.3 17 10.8C17 11.1 16.9 11.4 16.7 11.6S16.1 12 15.8 12H13L11.2 11.3L10.9 12.2L13 13H20M1 7H5V18H1V7Z" /></svg>`,
		html`<mwc-icon>thumb_up_alt</mwc-icon>`,
		html`<mwc-icon>thumb_up</mwc-icon><mwc-icon class="doubled-thumb-up">thumb_up</mwc-icon>`,
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
			.doubled-thumb-down,
			.doubled-thumb-up {
				margin-left: -1em;
				-webkit-text-stroke: 0.125rem var(--background-color);
			}
			.doubled-thumb-down {
				transform: translate(0.15rem, -0.0375rem) scale(0.75);
			}
			.doubled-thumb-up {
				transform: translate(-0.15rem, 0.0375rem) scale(0.75);
			}
		`;
	}
	
	static get properties() {
		return {
			type: { type: String, reflect: true }, /* artist, album, playlist */
			songs: { type: Array, attribute: false }
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
		this.songMenu.dataset.index = ev.currentTarget.parentElement.parentElement.dataset.index;
		
		handleMenuButton(ev, this.songMenu);
	}
	
	/**
	 * Send an event from the song list in response to a song menu item being clicked.
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
		this.dispatchEvent(new CustomEvent('play-now', {
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
		const SHOW_ART = (['artist', 'playlist', 'wrapped'].indexOf(this.type) !== -1),
			SHOW_ACTIONS = (this.type !== 'wrapped');
		return html`
			<table>
				<thead>
					<tr>
						${this.type === 'album' ? html`<th title="Track number">#</th>` : ''}
						${this.type === 'playlist' ? html`<th title="List index">#</th>` : ''}
						${this.type === 'wrapped' ? html`<th title="Ranking">#</th>` : ''}
						${SHOW_ART ? html`<th></th>` : ''}
						<th colspan="${SHOW_ACTIONS ? 2 : 1}">Title</th>
						<th><mwc-icon title="Duration">schedule</mwc-icon></th>
						${this.type !== 'artist' ? html`<th>Artist</th>` : ''}
						${this.type !== 'album' ? html`<th>Album</th>` : ''}
						<th><mwc-icon title="Playthroughs" aria-label="Playthroughs">music_note</mwc-icon></th>
						${this.type !== 'wrapped' ? html`<th><mwc-icon title="Rating" aria-label="Rating">thumbs_up_down</mwc-icon></th>` : ''}
					</tr>
				</thead>
				<tbody>
					${(this.songs || []).map((song, i) => html`
						<tr data-index="${i}">
							${this.type === 'album' ? html`<td class="index">${song.trackNo}</td>` : ''}
							${this.type === 'playlist' ? html`<td class="index">${song.listIndex + 1}</td>` : ''}
							${this.type === 'wrapped' ? html`<td class="index">${i + 1}</td>` : ''}
							${SHOW_ART ? html`<td><img class="album-art" src="${song.gDriveArt ? toGDriveURL(song.gDriveArt) : '/images/unknown_album.svg'}" alt="" /></td>` : ''}
							<td class="title" title="${song.title}" @dblclick="${this.handleDblClick}">${song.title}</td>
							${SHOW_ACTIONS ? html`<td><mwc-icon-button slot="meta" icon="more_vert" @click=${this.handleMenuButton}></mwc-icon-button></td>` : ''}
							<td class="duration">${formatDuration(song.duration / 1000)}</td>
							${this.type !== 'artist' ? html`<td class="artist" title="${formatArtist(song, true)}">${unsafeHTML(formatArtist(song, false))}</td>` : ''}
							${this.type !== 'album' ? html`<td class="album" title="${formatAlbum(song, true)}">${unsafeHTML(formatAlbum(song))}</td>` : ''}
							<td class="playthroughs">${song.playthroughs ?? ''}</td>
							${this.type !== 'wrapped' ? html`<td class="rating">${
								(typeof song.rating === 'undefined') ? '' : this.RATING_INDICATORS[song.rating + 2]
							}</td>` : ''}
						</tr>
					`)}
				</tbody>
			</table>
			<mwc-menu fixed wrapFocus @action="${this.handleMenuItemSelect}">
				<!-- Play/queue actions -->
				<mwc-list-item graphic="icon" value="play-now">
					<mwc-icon slot="graphic">play_arrow</mwc-icon>
					Play
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="play-next">
					<mwc-icon slot="graphic">playlist_play</mwc-icon>
					Play next
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="add-to-queue">
					<mwc-icon slot="graphic">queue_music</mwc-icon>
					Add to queue
				</mwc-list-item>
				<li divider role="separator"></li>
				<!-- Library actions -->
				<mwc-list-item graphic="icon" value="edit-song">
					<mwc-icon slot="graphic">edit</mwc-icon>
					Edit song
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">playlist_add</mwc-icon>
					Add to playlist
				</mwc-list-item>
				<li divider role="separator"></li>
				<!-- Navigation actions -->
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

window.customElements.define('songz-song-list', SongZSongList);
