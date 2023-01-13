'use strict';

import {LitElement, html, css} from 'lit';
//import {LitElement, html, css} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZAlbum extends LitElement {
	
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
			albumid: { type: String, reflect: true },
			pending: { type: Boolean, attribute: false },
			title: { type: String, reflect: true },
			songs: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
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
		setPageTitle('');
		this.message = undefined;
		this.songs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var albumRes = await fetch(`/api/albums/${this.albumid}`, { signal: this.loadAbortController.signal });
			await httpToJSError(albumRes);
			var album = await albumRes.json();
			setPageTitle(album.title);
			this.title = album.title;
			this.songs = album.songs;
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
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.songs ? html`<songz-song-list viewtype="album" .songs="${this.songs}"></songz-song-list>` : ''}
		`;
	}
}

window.customElements.define('songz-album', SongZAlbum);
