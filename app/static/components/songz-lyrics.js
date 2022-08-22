'use strict';

//import {LitElement, html, css}, css from 'lit';
import {LitElement, html, css} from 'https://unpkg.com/lit@2.3.1/index.js?module';

import {httpToJSError, toGDriveURL} from '../scripts/utils.js';

export class SongZLyrics extends LitElement {
	
	loadAbortController;
	
	static get styles() {
		return css`
			:host {
				box-sizing: border-box;
				padding: 0.5rem;
				white-space: normal;
				overflow-y: auto;
			}
			.message {
				text-align: center;
			}
			pre {
				margin: 0;
				text-align: left;
				font: inherit;
				font-size: 0.875rem;
				white-space: break-spaces;
			}
		`;
	}
	
	static get properties() {
		return {
			song: { type: Object, attribute: false },
			lyrics: { type: String, attribute: false },
			pending: { type: Boolean, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Load the new lyrics if the song has changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('song') && changedProperties.get('song') !== this.song) {
			this.loadAbortController?.abort();
			// Slightly hacky way to make it wait for the previous load to abort before starting the next one.
			setTimeout(() => this.loadLyrics(), 1);
		}
	}
	
	/**
	 * Load the song's lyrics.
	 * @returns {Promise} Resolves when the lyrics have been loaded and set to display
	 */
	async loadLyrics() {
		if (!this.song || !(this.song.gDriveLRC || this.song.gDriveMD)) {
			return;
		}
		this.lyrics = '';
		this.message = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			if (this.song.gDriveLRC) {
				await this.loadLRC();
			} else if (this.song.gDriveMD) {
				await this.loadMD();
			}
		} catch (err) {
			this.message = err;
		} finally {
			this.pending = false;
		}
	}
	
	async loadLRC() {
		var lyricsRes = await fetch(toGDriveURL(this.song.gDriveLRC, true), { signal: this.loadAbortController.signal });
		await httpToJSError(lyricsRes);
		var lyricsFileText = await lyricsRes.text();
		// For now, remove all LRC file tags and preceding whitespace, and only display the lyric text.
		// Later, this can be replaced with actually parsing the LRC file.
		this.lyrics = lyricsFileText.replace(/\[.*?\]/g, '').replace(/^\n+/, '');
	}
	
	async loadMD() {
		var lyricsRes = await fetch(toGDriveURL(this.song.gDriveMD, true), { signal: this.loadAbortController.signal });
		await httpToJSError(lyricsRes);
		this.lyrics = await lyricsRes.text();
		// TODO: Convert markdown to HTML
	}
	
	/**
	 * @override
	 */
	render() {
		if (!this.song) {
			return html`<p class="message">No song playing.</p>`;
		} else if (!this.song.gDriveLRC && !this.song.gDriveMD) {
			return html`<p class="message">No lyrics.</p>`;
		} else if (this.pending) {
			return html`<p class="message"><mwc-circular-progress indeterminate></mwc-circular-progress></p>`;
		} else if (this.message) {
			return html`<p class="message">${this.message}</p>`;
		} else {
			return html`<pre>${this.lyrics}</pre>`;
		}
	}
}

window.customElements.define('songz-lyrics', SongZLyrics);
