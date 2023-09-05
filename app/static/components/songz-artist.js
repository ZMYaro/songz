'use strict';

import {html} from 'lit';

import {SongZCollection} from './collection.js';
import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZArtist extends SongZCollection {
	
	/** @override */
	VIEW_TYPE = 'artist';
	/** @override */
	API_ENDPOINT = '/api/artists/';
	
	/**
	 * @override
	 */
	static get properties() {
		return {
			collectionid: { type: String, reflect: true },
			collectionname: { type: String, reflect: true },
			message: { type: String, reflect: true },
			pending: { type: Boolean, attribute: false },
			songs: { type: Array, attribute: false },
			composersongs: { type: Array, attribute: false }
		};
	}
	
	/**
	 * Load the list of the artist's artist and composer credits.
	 * @returns {Promise} Resolves when the artist and lists of songs has been loaded and set to display
	 */
	async loadSongs() {
		setPageTitle('');
		this.collectionname = '';
		this.message = undefined;
		this.songs = undefined;
		this.composersongs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var artistRes = await fetch(this.API_ENDPOINT + this.collectionid, { signal: this.loadAbortController.signal });
			await httpToJSError(artistRes);
			var artist = await artistRes.json();
			setPageTitle(artist.name);
			this.collectionname = artist.name;
			this.songs = artist.artistSongs;
			this.composersongs = artist.composerSongs;
		} catch (err) {
			this.message = err;
		} finally {
			this.pending = false;
		}
	}
	
	/**
	 * @override
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.shadowRoot.querySelectorAll('songz-song-list')
			.forEach((songList) => songList.requestUpdate());
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = '#artists'}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.collectionname || ''}</span>
				<mwc-icon-button icon="more_vert" slot="actionItems" @click="${() => this.actionsMenu.show()}"></mwc-icon-button>
			</mwc-top-app-bar-fixed>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.songs ?
				(this.songs.length === 0 ?
					html`<p>No artist credits</p>` :
					html`<songz-song-list viewtype="artist" .songs="${this.songs}"></songz-song-list>`
				) : ''
			}
			${this.composersongs ?
				(this.composersongs.length === 0 ?
					html`<hr /><p>No composer credits</p>` :
					html`<hr /><songz-song-list viewtype="composer" .songs="${this.composersongs}"></songz-song-list>`
				) : ''
			}
			<songz-collection-actions-menu viewtype="${this.VIEW_TYPE}" @action="${this.handleMenuItemSelect}"></songz-collection-actions-menu>
		`;
	}
}

window.customElements.define('songz-artist', SongZArtist);
