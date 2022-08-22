'use strict';

//import {LitElement, html, css} from 'lit';
import {LitElement, html, css} from 'https://unpkg.com/lit@2.3.1/index.js?module';

import {formatArtist, httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZAlbumsList extends LitElement {
	
	loadAbortController;
	
	static get styles() {
		return css`
			a {
				text-decoration: none;
			}
			p {
				text-align: center;
			}
		`;
	}
	
	static get properties() {
		return {
			pending: { type: Boolean, attribute: false },
			albums: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadAlbums();
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * Load the list of albums.
	 * @returns {Promise} Resolves when the list of albums has been loaded and set to display
	 */
	async loadAlbums() {
		setPageTitle('Albums');
		this.message = undefined;
		this.albums = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var albumsRes = await fetch('/api/albums', { signal: this.loadAbortController.signal });
			await httpToJSError(albumsRes);
			this.albums = await albumsRes.json();
			if (this.albums.length === 0) {
				this.message = 'No albums';
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
		this.requestUpdate();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="albums"></songz-main-top-bar>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.albums ? html`
				<mwc-list>
					${(this.albums || []).map((album, i) => html`
						<a href="#albums/${album._id}">
							<mwc-list-item twoline>
								${album.title}
								<span slot="secondary">${formatArtist(album, true)}</span>
							</mwc-list-item>
						</a>
					`)}
				</mwc-list>`
			: ''}
		`;
	}
}

window.customElements.define('songz-albums-list', SongZAlbumsList);
