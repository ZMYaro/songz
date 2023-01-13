'use strict';

import {LitElement, html, css} from 'lit';
//import {LitElement, html, css} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZPlaylistsList extends LitElement {
	
	loadAbortController;
	
	static get styles() {
		return css`
			a {
				text-decoration: none;
			}
			p {
				text-align: center;
			}
		`;
	}
	
	static get properties() {
		return {
			pending: { type: Boolean, attribute: false },
			playlists: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadPlaylists();
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * Load the list of playlists.
	 * @returns {Promise} Resolves when the list of playlists has been loaded and set to display
	 */
	async loadPlaylists() {
		setPageTitle('Playlists');
		this.message = undefined;
		this.playlists = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var playlistsRes = await fetch('/api/playlists', { signal: this.loadAbortController.signal });
			await httpToJSError(playlistsRes);
			this.playlists = await playlistsRes.json();
			if (this.playlists.length === 0) {
				this.message = 'No playlists';
			}
		} catch (err) {
			this.message = err;
		} finally {
			this.pending = false;
		}
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
			<songz-main-top-bar selected="playlists"></songz-main-top-bar>
			<button @click="${this.createNewPlaylist}">Create new playlist</button>
			<br />
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.playlists ? html`
				<mwc-list>
					${(this.playlists || []).map((playlist, i) => html`
						<a href="#playlists/${playlist._id}">
							<mwc-list-item>
								${playlist.title}
							</mwc-list-item>
						</a>
					`)}
				</mwc-list>`
			: ''}
		`;
	}
}

window.customElements.define('songz-playlists-list', SongZPlaylistsList);
