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
		`;
	}
	
	static get properties() {
		return {
			type: { type: String, reflect: true }, /* artist, album, playlist */
			songs: { type: Array, attribute: false }
		};
	}
	
	render() {
		return html`
			<table>
				<thead>
					<tr>
						<th>#</th>
						<th>Title</th>
						<th><mwc-icon title="Duration">schedule</mwc-icon></th>
						${this.type === 'artist' ? '' : html`<th>Artist</th>`}
						${this.type === 'album' ? '' : html`<th>Album</th>`}
						<th><mwc-icon title="Playthroughs" aria-label="Playthroughs">music_note</mwc-icon></th>
						<th><mwc-icon title="Rating" aria-label="Rating">thumbs_up_down</mwc-icon></th>
					</tr>
				</thead>
				<tbody>
					${(this.songs || []).map((song) => html`
						<tr>
							<!-- Show the playlist index, if specified; else show track number. -->
							<td class="index">${song.listIndex}</td>
							<td class="title">${song.title}</td>
							<td class="duration">${formatDuration(song.duration)}</td>
							${this.type === 'artist' ? '' : html`<td class="artist">${unsafeHTML(formatArtist(song, false))}</td>`}
							${this.type === 'album' ? '' : html`<td class="album">${unsafeHTML(formatAlbum(song))}</td>`}
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
