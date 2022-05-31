'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZPlaylist extends LitElement {
	
	loadAbortController;
	
	static get styles() {
		return css`
			p {
				text-align: center;
			}
		`;
	}
	
	static get properties() {
		return {
			playlistid: { type: String, reflect: true },
			pending: { type: Boolean, attribute: false },
			title: { type: String, reflect: true },
			description: { type: String, reflect: true },
			songs: { type: Array, attribute: false }
		};
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * @override
	 * Load the new playlist if the ID is changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('playlistid') && changedProperties.get('playlistid') !== this.playlistid) {
			this.loadPlaylist();
		}
	}
	
	/**
	 * Load the list of playlists.
	 * @returns {Promise} Resolves when the list of playlists has been loaded and set to display
	 */
	async loadPlaylist() {
		setPageTitle('');
		this.title = '';
		this.description = undefined;
		this.songs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var playlistRes = await fetch(`/api/playlists/${this.playlistid}`, { signal: this.loadAbortController.signal });
			await httpToJSError(playlistRes);
			var playlist = await playlistRes.json();
			setPageTitle(playlist.title);
			this.title = playlist.title;
			this.description = playlist.description;
			this.songs = playlist.songs;
		} catch (err) {
			this.description = err;
		} finally {
			this.pending = false;
		}
	}
	
	// TEMP
	async addSongToPlaylist() {
		var songId = prompt('Song ID?');
		if (!songId?.trim()) {
			return;
		}
		
		var playlistItemRes = await fetch(`/api/playlists/${this.playlistid}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: 'song-id=' + encodeURIComponent(songId)
			}),
			newPlaylistItem = await playlistItemRes.json();
		this.songs.push(newPlaylistItem);
		this.requestUpdate();
	}
	
	/**
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.shadowRoot.querySelector('songz-song-list').requestUpdate();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#playlists'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.title || ''}</span>
				<button slot="actionItems" @click="${this.addSongToPlaylist}">Add song</button>
			</mwc-top-app-bar-fixed>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.description ? html`<p>${this.description}</p>` : ''}
			${this.songs ? html`<songz-song-list viewtype="playlist" .songs="${this.songs}"></songz-song-list>` : ''}
		`;
	}
}

window.customElements.define('songz-playlist', SongZPlaylist);
