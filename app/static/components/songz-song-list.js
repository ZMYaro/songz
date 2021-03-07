'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import {unsafeHTML} from 'https://unpkg.com/lit-html@1.3.0/directives/unsafe-html.js?module';
//import '@material/mwc-icon-button';
import 'https://unpkg.com/@material/mwc-icon-button@0.20.0/mwc-icon-button.js?module';

//import '@material/mwc-icon';
import 'https://unpkg.com/@material/mwc-icon@0.20.0/mwc-icon.js?module';

import {formatAlbum, formatArtist, formatDuration} from '../scripts/utils.js';

export class SongZSongList extends LitElement {
	
	songMenu = undefined;
	
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
			td {
				cursor: default;
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
		ev.stopPropagation();
		// Tell the menu which song it is open for.
		this.songMenu.dataset.index = ev.currentTarget.parentElement.parentElement.dataset.index;
		// Open the menu from the button.
		this.songMenu.anchor = ev.currentTarget;
		this.songMenu.show();
	}
	
	/**
	 * Send an event from the song list in response to a song menu item being clicked.
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
		ev.preventDefault();
		this.dispatchEvent(new CustomEvent('play-now', {
			detail: ev.currentTarget.parentElement.dataset.index
		}));
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<table>
				<thead>
					<tr>
						${this.type === 'album' ? html`<th title="Track number">#</th>` : ''}
						${this.type === 'playlist' ? html`<th title="List index">#</th>` : ''}
						<th colspan="2">Title</th>
						<th><mwc-icon title="Duration">schedule</mwc-icon></th>
						${this.type !== 'artist' ? html`<th>Artist</th>` : ''}
						${this.type !== 'album' ? html`<th>Album</th>`: ''}
						<th><mwc-icon title="Playthroughs" aria-label="Playthroughs">music_note</mwc-icon></th>
						<th><mwc-icon title="Rating" aria-label="Rating">thumbs_up_down</mwc-icon></th>
					</tr>
				</thead>
				<tbody>
					${(this.songs || []).map((song, i) => html`
						<tr data-index="${i}">
							${this.type === 'album' ? html`<td class="index">${song.trackNo}</td>` : ''}
							${this.type === 'playlist' ? html`<td class="index">${song.listIndex}</td>` : ''}
							<td class="title" title="${song.title}" @dblclick="${this.handleDblClick}">${song.title}</td>
							<td><mwc-icon-button slot="meta" icon="more_vert" @click=${this.handleMenuButton}></mwc-icon-button></td>
							<td class="duration">${formatDuration(song.duration / 1000)}</td>
							${this.type !== 'artist' ? html`<td class="artist" title="${formatArtist(song, true)}">${unsafeHTML(formatArtist(song, false))}</td>` : ''}
							${this.type !== 'album' ? html`<td class="album" title="${formatAlbum(song, true)}">${unsafeHTML(formatAlbum(song))}</td>` : ''}
							<td class="playthroughs"></td>
							<td class="rating"></td>
						</tr>
					`)}
				</tbody>
			</table>
			<mwc-menu fixed wrapFocus>
				<mwc-list-item graphic="icon" data-action="play-now" @click=${this.handleMenuItemSelect}>
					<mwc-icon slot="graphic">play_arrow</mwc-icon>
					Play now
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">playlist_play</mwc-icon>
					Play next
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">queue_music</mwc-icon>
					Add to queue
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

window.customElements.define('songz-song-list', SongZSongList);
