'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZAlbumsList extends LitElement {
	
	static get properties() {
		return {
			albums: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.albums = [];
		this.loadAlbums();
	}
	
	/**
	 * Load the list of albums.
	 * @returns {Promise} Resolves when the list of albums has been loaded and set to display
	 */
	async loadAlbums() {
		let albumsRes = await fetch('/api/albums');
		this.albums = await albumsRes.json();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="albums"></songz-main-top-bar>
			${this.albums.length === 0 ?
				'No albums' :
				html`
					<ul>
						${(this.albums || []).map((album, i) => html`
							<li>
								<a href="#albums/${album._id}">
									${album.title}
								</a>
							</li>
						`)}
					</ul>
				`
			}
		`;
	}
}

window.customElements.define('songz-albums-list', SongZAlbumsList);
