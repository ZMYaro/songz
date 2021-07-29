'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

export class SongZPlaylist extends LitElement {
	
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
			title: { type: String, reflect: true },
			description: { type: String, reflect: true },
			songs: { type: Array, attribute: false }
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
		this.songs = undefined;
		var playlistRes = await fetch(`/api/playlists/${this.playlistid}`),
			playlist = await playlistRes.json();
		this.title = playlist.title;
		this.description = playlist.description;
		this.songs = playlist.songs;
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
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#playlists'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.title || ''}</span>
				<button slot="actionItems" @click="${this.addSongToPlaylist}">Add song</button>
			</mwc-top-app-bar-fixed>
			<p>${this.description || ''}</p>
			${!this.songs ?
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` :
				html`<songz-song-list type="playlist" .songs="${this.songs}"></songz-song-list>`
			}
		`;
	}
}

window.customElements.define('songz-playlist', SongZPlaylist);
