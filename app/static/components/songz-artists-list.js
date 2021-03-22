'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

export class SongZArtistsList extends LitElement {
	
	static get properties() {
		return {
			artists: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.artists = [];
		this.loadArtists();
	}
	
	/**
	 * Load the list of artists.
	 * @returns {Promise} Resolves when the list of artists has been loaded and set to display
	 */
	async loadArtists() {
		let artistsRes = await fetch('/api/artists');
		this.artists = await artistsRes.json();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="artists"></songz-main-top-bar>
			${this.artists.length === 0 ?
				'No artists' :
				html`
					<ul>
						${(this.artists || []).map((artist, i) => html`
							<li>
								<a href="#artists/${artist._id}">
									${artist.name}
								</a>
							</li>
						`)}
					</ul>
				`
			}
		`;
	}
}

window.customElements.define('songz-artists-list', SongZArtistsList);
