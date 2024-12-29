'use strict';

import {SongZCollection} from './songz-collection.js';

export class SongZAlbum extends SongZCollection {
	/** @override */
	VIEW_TYPE = 'album';
	/** @override */
	API_ENDPOINT = '/api/albums/';
}

window.customElements.define('songz-album', SongZAlbum);
