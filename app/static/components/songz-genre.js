'use strict';

import {SongZCollection} from './songz-collection.js';

export class SongZGenre extends SongZCollection {
	/** @override */
	VIEW_TYPE = 'genre';
	/** @override */
	API_ENDPOINT = '/api/genres/';
}

window.customElements.define('songz-genre', SongZGenre);
