'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZAlbum extends LitElement {
	
	static get properties() {
		return {
			albumid: { type: String, reflect: true },
			album: { type: Object, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Load the new album if the ID is changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('albumid') && changedProperties.get('albumid') !== this.albumid) {
			this.loadAlbum();
		}
	}
	
	/**
	 * Load the list of albums.
	 * @returns {Promise} Resolves when the list of albums has been loaded and set to display
	 */
	async loadAlbum() {
		this.album = { title: '...', songs: [] };
		var albumRes = await fetch(`/api/albums/${this.albumid}`),
			album = await albumRes.json();
		this.album = album;
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#albums'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.album?.title}</span>
			</mwc-top-app-bar-fixed>
			<songz-song-list type="album" .songs="${this.album?.songs}"></songz-song-list>
		`;
	}
}

window.customElements.define('songz-album', SongZAlbum);
