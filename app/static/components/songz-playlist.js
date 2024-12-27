'use strict';

import {SongZCollection} from './songz-collection.js';

export class SongZPlaylist extends SongZCollection {
	/** @override */
	VIEW_TYPE = 'playlist';
	/** @override */
	API_ENDPOINT = '/api/playlists/';
}

window.customElements.define('songz-playlist', SongZPlaylist);
