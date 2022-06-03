'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZGenre extends LitElement {
	
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
			genreid: { type: String, reflect: true },
			pending: { type: Boolean, attribute: false },
			name: { type: String, reflect: true },
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
	 * Load the new genre if the ID is changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('genreid') && changedProperties.get('genreid') !== this.genreid) {
			this.loadGenre();
		}
	}
	
	/**
	 * Load the list of genres.
	 * @returns {Promise} Resolves when the list of genres has been loaded and set to display
	 */
	async loadGenre() {
		setPageTitle('');
		this.message = undefined;
		this.songs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var genreRes = await fetch(`/api/genres/${this.genreid}`, { signal: this.loadAbortController.signal });
			await httpToJSError(genreRes);
			var genre = await genreRes.json();
			setPageTitle(genre.name);
			this.name = genre.name;
			this.songs = genre.songs;
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
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#genres'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.name || ''}</span>
			</mwc-top-app-bar-fixed>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.songs ? html`<songz-song-list viewtype="genre" .songs="${this.songs}"></songz-song-list>` : ''}
		`;
	}
}

window.customElements.define('songz-genre', SongZGenre);
