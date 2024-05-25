'use strict';

import {SongZCollection} from './collection.js';
import {httpToJSError} from '../scripts/utils.js';

export class SongZPlaylist extends SongZCollection {
	/** @override */
	VIEW_TYPE = 'playlist';
	/** @override */
	API_ENDPOINT = '/api/playlists/';
	
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
			archived: { type: Boolean, reflect: true } // If undefined, assume it is pending.
		};
	}
	
	async toggleArchived() {
		var reqBody = new URLSearchParams({
			id: this.collectionid,
			archived: !this.archived
		});
		
		// Show the status in the client as indeterminate.
		this.archived = undefined;
		
		this.loadAbortController = new AbortController();
		try {
			var collectionRes = await fetch(this.API_ENDPOINT, {
				method: 'PUT',
				body: reqBody,
				signal: this.loadAbortController.signal
			});
			await httpToJSError(collectionRes);
			var collection = await collectionRes.json();
			this.archived = collection.archived;
			// Re-show the description in case it was previously overwritten by an error message.
			this.message = collection.description;
		} catch (err) {
			this.message = err;
		}
	}
}

window.customElements.define('songz-playlist', SongZPlaylist);
