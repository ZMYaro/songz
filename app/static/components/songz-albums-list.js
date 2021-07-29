'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {formatArtist} from '../scripts/utils.js';

export class SongZAlbumsList extends LitElement {
	
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
			albums: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadAlbums();
	}
	
	/**
	 * Load the list of albums.
	 * @returns {Promise} Resolves when the list of albums has been loaded and set to display
	 */
	async loadAlbums() {
		this.albums = undefined;
		let albumsRes = await fetch('/api/albums');
		this.albums = await albumsRes.json();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="albums"></songz-main-top-bar>
			${!this.albums ?
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` :
			this.albums.length === 0 ?
				html`<p>No albums</p>` :
				html`
					<mwc-list>
						${(this.albums || []).map((album, i) => html`
							<a href="#albums/${album._id}">
								<mwc-list-item twoline>
									${album.title}
									<span slot="secondary">${formatArtist(album, true)}</span>
								</mwc-list-item>
							</a>
						`)}
					</mwc-list>
				`
			}
		`;
	}
}

window.customElements.define('songz-albums-list', SongZAlbumsList);
