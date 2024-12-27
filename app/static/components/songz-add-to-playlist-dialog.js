'use strict';

import {LitElement, html} from 'lit';
//import {LitElement, html} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {SelfRemovingSnackbar} from '../scripts/self_removing_snackbar.js';
import {httpToJSError} from '../scripts/utils.js';

export class SongZAddToPlaylistDialog extends LitElement {
	
	dialog;
	
	static get properties() {
		return {
			pending: { type: Boolean, attribute: false },
			playlists: { type: Array, attribute: false },
			message: { type: String, attribute: false },
			song: { type: Object, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Get a reference to the dialog when the element is first updated.
	 */
	firstUpdated() {
		this.dialog = this.querySelector('mwc-dialog');
	}
	
	/**
	 * Show the dialog.
	 * @param {Song} song
	 */
	show(song) {
		this.song = song;
		this.dialog.heading = `Add \u201c${this.song.title}\u201d to playlist`;
		this.loadPlaylists();
		this.dialog.show();
	}
	
	/**
	 * Load the list of playlists.
	 * @returns {Promise} Resolves when the list of playlists has been loaded and set to display
	 */
	async loadPlaylists() {
		this.message = undefined;
		this.playlists = undefined;
		this.pending = true;
		try {
			var playlistsRes = await fetch('/api/playlists');
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
	
	/**
	 * Add the song to the selected playlist.
	 * @param {CustomEvent} ev - The onselected event from the menu
	 * @returns {Promise} Resolves when the song has been added
	 */
	async addSongToPlaylist(ev) {
		this.pending = true;
		var message = '';
		
		try {
			var playlist = this.playlists[ev.detail.index],
				playlistItemRes = await fetch(`/api/playlists/${playlist._id}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: 'song-id=' + encodeURIComponent(this.song._id)
				});
			await httpToJSError(playlistItemRes);
			
			message = `Added \u201c${this.song.title}\u201d to \u201c${playlist.title}\u201d.`;
		} catch (err) {
			message = `Something went wrong adding \u201c${this.song.title}\u201d to \u201c${playlist.title}\u201d: ${err}`;
		}
		
		this.dialog.close();
		new SelfRemovingSnackbar(message);
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-dialog heading="Add to playlist" scrimClickAction="" escapeKeyAction="${this.pending ? '' : 'close'}">
				<mwc-list fixed wrapFocus @action="${this.addSongToPlaylist}" style="margin: 0 -24px;">
					${this.message ? html`<mwc-list-item noninteractive>${this.message}</mwc-list-item>` : ''}
					${this.pending ? html`
						<mwc-list-item noninteractive>
							<mwc-circular-progress indeterminate></mwc-circular-progress>
						</mwc-list-item>
					` : (this.playlists || []).map((playlist, i) => html`
						<mwc-list-item>
							${playlist.title}
						</mwc-list-item>
					`)}
				</mwc-list>
				<mwc-button slot="secondaryAction" dialogAction="close" ?disabled="${this.pending}">Cancel</mwc-button>
			</mwc-dialog>
		`;
	}
	
	/**
	 * @override
	 * Prevent the component having a shadow root.
	 */
	createRenderRoot() {
		return this;
	}
}

window.customElements.define('songz-add-to-playlist-dialog', SongZAddToPlaylistDialog);
