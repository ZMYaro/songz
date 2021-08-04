'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZSongsList extends LitElement {
	
	static get styles() {
		return css`
			p {
				text-align: center;
			}
		`;
	}
	
	static get properties() {
		return {
			songs: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadSongs();
	}
	
	/**
	 * Load the list of songs.
	 * @returns {Promise} Resolves when the list of songs has been loaded and set to display
	 */
	async loadSongs() {
		setPageTitle('Songs');
		this.message = undefined;
		this.songs = undefined;
		try {
			var songsRes = await fetch('/api/songs');
			httpToJSError(songsRes);
			this.songs = await songsRes.json();
			if (this.songs.length === 0) {
				this.message = 'No songs';
			}
		} catch (err) {
			this.message = err;
		}
	}
	
	/**
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.shadowRoot.querySelector('songz-song-list')?.requestUpdate();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="songs"></songz-main-top-bar>
			${this.message ?
				html`<p>${this.message}</p>`
			: this.songs ?
				html`<songz-song-list .songs="${this.songs}"></songz-song-list>`
			:
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>`
			}
		`;
	}
}

window.customElements.define('songz-songs-list', SongZSongsList);
