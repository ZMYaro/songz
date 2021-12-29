'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZArtist extends LitElement {
	
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
			artistid: { type: String, reflect: true },
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
	 * Load the new artist if the ID is changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('artistid') && changedProperties.get('artistid') !== this.artistid) {
			this.loadArtist();
		}
	}
	
	/**
	 * Load the list of artists.
	 * @returns {Promise} Resolves when the list of artists has been loaded and set to display
	 */
	async loadArtist() {
		setPageTitle('');
		this.name = '';
		this.message = undefined;
		this.songs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var artistRes = await fetch(`/api/artists/${this.artistid}`, { signal: this.loadAbortController.signal });
			await httpToJSError(artistRes);
			var artist = await artistRes.json();
			setPageTitle(artist.name);
			this.name = artist.name;
			this.songs = artist.songs;
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
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#artists'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.name || ''}</span>
			</mwc-top-app-bar-fixed>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.songs ? html`<songz-song-list type="artist" .songs="${this.songs}"></songz-song-list>` : ''}
		`;
	}
}

window.customElements.define('songz-artist', SongZArtist);
