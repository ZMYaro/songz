'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZPlaylist extends LitElement {
	
	static get properties() {
		return {
			playlistid: { type: String, reflect: true },
			playlist: { type: Object, attribute: false }
		};
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
		this.playlist = { title: '...', description: '', songs: [] };
		var playlistRes = await fetch(`/api/playlists/${this.playlistid}`),
			playlist = await playlistRes.json();
		this.playlist = playlist;
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
		this.playlist.songs.push(newPlaylistItem);
		this.requestUpdate();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#playlists'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.playlist?.title}</span>
				<button slot="actionItems" @click="${this.addSongToPlaylist}">Add song</button>
			</mwc-top-app-bar-fixed>
			<p>${this.playlist?.description || ''}</p>
			<songz-song-list .songs="${this.playlist?.songs}"></songz-song-list>
		`;
	}
}

window.customElements.define('songz-playlist', SongZPlaylist);
