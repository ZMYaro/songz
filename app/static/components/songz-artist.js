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
			artistsongs: { type: Array, attribute: false },
			composersongs: { type: Array, attribute: false },
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
	 * @returns {Promise} Resolves when the artist and lists of songs has been loaded and set to display
	 */
	async loadArtist() {
		setPageTitle('');
		this.name = '';
		this.message = undefined;
		this.artistsongs = undefined;
		this.composersongs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var artistRes = await fetch(`/api/artists/${this.artistid}`, { signal: this.loadAbortController.signal });
			await httpToJSError(artistRes);
			var artist = await artistRes.json();
			setPageTitle(artist.name);
			this.name = artist.name;
			this.artistsongs = artist.artistSongs;
			this.composersongs = artist.composerSongs;
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
		this.shadowRoot.querySelectorAll('songz-song-list').forEach((songList) => songList.requestUpdate());
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
			${this.artistsongs ?
				(this.artistsongs.length === 0 ?
					html`<p>No artist credits</p>` :
					html`<songz-song-list viewtype="artist" .songs="${this.artistsongs}"></songz-song-list>`
				) : ''
			}
			${this.composersongs ?
				(this.composersongs.length === 0 ?
					html`<hr /><p>No composer credits</p>` :
					html`<hr /><songz-song-list viewtype="composer" .songs="${this.composersongs}"></songz-song-list>`
				) : ''
			}
		`;
	}
}

window.customElements.define('songz-artist', SongZArtist);
