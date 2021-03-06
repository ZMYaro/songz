'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';
import {unsafeHTML} from 'https://unpkg.com/lit-html@1.3.0/directives/unsafe-html.js?module';

//import '@material/mwc-icon';
import 'https://unpkg.com/@material/mwc-icon@0.19.1/mwc-icon.js?module';

import {formatAlbum, formatArtist, formatDuration} from '../scripts/utils.js';

export class SongZSongList extends LitElement {
	
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
	
	handleDblClick(ev) {
		ev.preventDefault();
		this.dispatchEvent(new CustomEvent('play-now', {
			detail: ev.currentTarget.parentElement.dataset.index
		}));
	}
	
	render() {
		return html`
			<table>
				<thead>
					<tr>
						${this.type === 'album' ? html`<th title="Track number">#</th>` : ''}
						${this.type === 'playlist' ? html`<th title="List index">#</th>` : ''}
						<th>Title</th>
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
							<td class="duration">${formatDuration(song.duration)}</td>
							<td class="title" title="${song.title}" @dblclick="${this.handleDblClick}">${song.title}</td>
							${this.type !== 'artist' ? html`<td class="artist" title="${formatArtist(song, true)}">${unsafeHTML(formatArtist(song, false))}</td>` : ''}
							${this.type !== 'album' ? html`<td class="album" title="${formatAlbum(song, true)}">${unsafeHTML(formatAlbum(song))}</td>` : ''}
							<td class="playthroughs"></td>
							<td class="rating"></td>
						</tr>
					`)}
				</tbody>
			</table>
		`;
	}
}

window.customElements.define('songz-song-list', SongZSongList);
