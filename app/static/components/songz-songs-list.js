'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZSongsList extends LitElement {
	
	static get properties() {
		return {
			songs: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.songs = [];
		this.loadSongs();
	}
	
	/**
	 * Load the list of songs.
	 * @returns {Promise} Resolves when the list of songs has been loaded and set to display
	 */
	async loadSongs() {
		let songsRes = await fetch('/api/songs');
		this.songs = await songsRes.json();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="songs"></songz-main-top-bar>
			${this.songs.length === 0 ?
				'No songs' :
				html`<songz-song-list .songs="${this.songs}"></songz-song-list>`
			}
		`;
	}
}

window.customElements.define('songz-songs-list', SongZSongsList);
