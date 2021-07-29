'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

export class SongZArtistsList extends LitElement {
	
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
			artists: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadArtists();
	}
	
	/**
	 * Load the list of artists.
	 * @returns {Promise} Resolves when the list of artists has been loaded and set to display
	 */
	async loadArtists() {
		this.artists = undefined;
		let artistsRes = await fetch('/api/artists');
		this.artists = await artistsRes.json();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="artists"></songz-main-top-bar>
			${!this.artists ?
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` :
			this.artists.length === 0 ?
				html`<p>No artists</p>` :
				html`
					<mwc-list>
						${(this.artists || []).map((artist, i) => html`
							<a href="#artists/${artist._id}">
								<mwc-list-item>
									${artist.name}
								</mwc-list-item>
							</a>
						`)}
					</mwc-list>
				`
			}
		`;
	}
}

window.customElements.define('songz-artists-list', SongZArtistsList);
