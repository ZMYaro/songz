'use strict';

//import {LitElement, html, css} from 'lit';
import {LitElement, html, css} from 'https://unpkg.com/lit@2.3.1/index.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZGenresList extends LitElement {
	
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
			genres: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	constructor() {
		super();
		this.loadGenres();
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * Load the list of genres.
	 * @returns {Promise} Resolves when the list of genres has been loaded and set to display
	 */
	async loadGenres() {
		setPageTitle('Genres');
		this.message = undefined;
		this.genres = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var genresRes = await fetch('/api/genres', { signal: this.loadAbortController.signal });
			await httpToJSError(genresRes);
			this.genres = await genresRes.json();
			if (this.genres.length === 0) {
				this.message = 'No genres';
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
			<songz-main-top-bar selected="genres"></songz-main-top-bar>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.genres ? html`
				<mwc-list>
					${(this.genres || []).map((genre, i) => html`
						<a href="#genres/${genre._id}">
							<mwc-list-item>
								${genre.name}
							</mwc-list-item>
						</a>
					`)}
				</mwc-list>`
			: ''}
		`;
	}
}

window.customElements.define('songz-genres-list', SongZGenresList);
