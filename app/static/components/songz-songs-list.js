'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

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
			songs: { type: Array, attribute: false }
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
		this.songs = undefined;
		let songsRes = await fetch('/api/songs');
		this.songs = await songsRes.json();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="songs"></songz-main-top-bar>
			${!this.songs ?
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` :
			this.songs.length === 0 ?
				html`<p>No songs</p>` :
				html`<songz-song-list .songs="${this.songs}"></songz-song-list>`
			}
		`;
	}
}

window.customElements.define('songz-songs-list', SongZSongsList);
