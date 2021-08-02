'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {setPageTitle} from '../scripts/utils.js';

export class SongZAlbum extends LitElement {
	
	static get styles() {
		return css`
			p {
				text-align: center;
			}
		`;
	}
	
	static get properties() {
		return {
			albumid: { type: String, reflect: true },
			title: { type: String, reflect: true },
			songs: { type: Array, attribute: false }
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
		setPageTitle('[Album]');
		this.songs = undefined;
		var albumRes = await fetch(`/api/albums/${this.albumid}`),
			album = await albumRes.json();
		setPageTitle(album.title);
		this.title = album.title;
		this.songs = album.songs;
	}
	
	/**
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.shadowRoot.querySelector('songz-song-list').requestUpdate();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#albums'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.title || ''}</span>
			</mwc-top-app-bar-fixed>
			${!this.songs ?
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` :
				html`<songz-song-list type="album" .songs="${this.songs}"></songz-song-list>`
			}
		`;
	}
}

window.customElements.define('songz-album', SongZAlbum);
