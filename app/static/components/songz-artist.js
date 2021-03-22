'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZArtist extends LitElement {
	
	static get properties() {
		return {
			artistid: { type: String, reflect: true },
			artist: { type: Object, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Load the new artist if the ID is changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('artistid') && changedProperties.get('artistid') !== this.artistid) {
			this.loadArtist();
		}
	}
	
	/**
	 * Load the list of artists.
	 * @returns {Promise} Resolves when the list of artists has been loaded and set to display
	 */
	async loadArtist() {
		this.artist = { name: '...', songs: [] };
		var artistRes = await fetch(`/api/artists/${this.artistid}`),
			artist = await artistRes.json();
		this.artist = artist;
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#artists'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.artist?.name}</span>
			</mwc-top-app-bar-fixed>
			<songz-song-list type="artist" .songs="${this.artist?.songs}"></songz-song-list>
		`;
	}
}

window.customElements.define('songz-artist', SongZArtist);
