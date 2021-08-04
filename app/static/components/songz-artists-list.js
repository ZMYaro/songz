'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZArtistsList extends LitElement {
	
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
			artists: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadArtists();
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * Load the list of artists.
	 * @returns {Promise} Resolves when the list of artists has been loaded and set to display
	 */
	async loadArtists() {
		setPageTitle('Artists');
		this.message = undefined;
		this.artists = undefined;
		this.loadAbortController = new AbortController();
		try {
			var artistsRes = await fetch('/api/artists', { signal: this.loadAbortController.signal });
			httpToJSError(artistsRes);
			this.artists = await artistsRes.json();
			if (this.artists.length === 0) {
				this.message = 'No artists';
			}
		} catch (err) {
			this.message = err;
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
			<songz-main-top-bar selected="artists"></songz-main-top-bar>
			${this.message ?
				html`<p>${this.message}</p>`
			: this.artists ?
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
			:
				html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>`
			}
		`;
	}
}

window.customElements.define('songz-artists-list', SongZArtistsList);
