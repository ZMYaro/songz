'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZPlaylistsList extends LitElement {
	
	static get properties() {
		return {
			playlists: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		
		this.playlists = [];
		this.loadPlaylists();
	}
	
	/**
	 * Load the list of playlists.
	 * @returns {Promise} Resolves when the list of playlists has been loaded and set to display
	 */
	async loadPlaylists() {
		let playlistsRes = await fetch('/api/playlists'),
			playlists = await playlistsRes.json();
		this.playlists = playlists;
	}
	
	// TEMP
	async createNewPlaylist() {
		var title = prompt('Playlist title?');
		if (!title?.trim()) {
			return;
		}
		
		let playlistRes = await fetch('/api/playlists', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: 'title=' + encodeURIComponent(title)
		});
		this.loadPlaylists();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="playlists"></songz-main-top-bar>
			<button @click="${this.createNewPlaylist}">Create new playlist</button>
			<br />
			${this.playlists.length === 0 ?
				'No playlists' :
				html`
					<ul>
						${(this.playlists || []).map((playlist, i) => html`
							<li>
								<a href="#playlists/${playlist._id}">
									${playlist.title}
								</a>
							</li>
						`)}
					</ul>
				`
			}
		`;
	}
}

window.customElements.define('songz-playlists-list', SongZPlaylistsList);
