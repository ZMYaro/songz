'use strict';

//import {LitElement, html, css} from 'lit';
import {LitElement, html, css} from 'https://unpkg.com/lit@2.3.1/index.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZSongsList extends LitElement {
	
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
			pending: { type: Boolean, attribute: false },
			songs: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadSongs();
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * Load the list of songs.
	 * @returns {Promise} Resolves when the list of songs has been loaded and set to display
	 */
	async loadSongs() {
		setPageTitle('Songs');
		this.message = undefined;
		this.songs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var songsRes = await fetch('/api/songs', { signal: this.loadAbortController.signal });
			await httpToJSError(songsRes);
			this.songs = await songsRes.json();
			if (this.songs.length === 0) {
				this.message = 'No songs';
			}
		} catch (err) {
			this.message = err;
		} finally {
			this.pending = false;
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
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.songs ? html`<songz-song-list .songs="${this.songs}"></songz-song-list>` : ''}
		`;
	}
}

window.customElements.define('songz-songs-list', SongZSongsList);
