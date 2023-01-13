'use strict';

import {LitElement, html, css} from 'lit';
//import {LitElement, html, css} from 'https://unpkg.com/lit@2.6.1/index.js?module';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
//import {unsafeHTML} from 'https://unpkg.com/lit@2.6.1/directives/unsafe-html.js?module';

import {furiganaMarkdownIt} from '../scripts/furigana-markdown-it-modulified/index.js';

import {httpToJSError, toGDriveURL} from '../scripts/utils.js';

export class SongZLyrics extends LitElement {
	
	mdParser;
	loadAbortController;
	
	static get styles() {
		return css`
			:host {
				box-sizing: border-box;
				padding: 0.5rem;
				white-space: normal;
				overflow-y: auto;
				
				text-align: left;
				font-size: 0.875rem;
			}
			.message {
				text-align: center;
			}
			h1 {
				font-size: 1rem;
				margin: 0;
			}
			pre {
				margin: 0;
				font: inherit;
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
	
	constructor() {
		super();
		this.mdParser = window.markdownit({
			breaks: true
		}).use(furiganaMarkdownIt());
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
		this.lyrics = `<pre>${lyricsFileText.replace(/\[.*?\]/g, '').replace(/^\n+/, '')}</pre>`;
	}
	
	async loadMD() {
		var lyricsRes = await fetch(toGDriveURL(this.song.gDriveMD, true), { signal: this.loadAbortController.signal });
		await httpToJSError(lyricsRes);
		var lyricsText = await lyricsRes.text(),
			lyricsHTML = this.mdParser.render(lyricsText);
		this.lyrics = lyricsHTML;
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
			return unsafeHTML(this.lyrics);
		}
	}
}

window.customElements.define('songz-lyrics', SongZLyrics);
