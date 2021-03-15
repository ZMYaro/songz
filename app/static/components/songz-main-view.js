'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@polymer/app-layout'; // Needed for <app-drawer> and <app-drawer-layout>.
import 'https://unpkg.com/@polymer/app-layout@3.1.0/app-layout.js?module';

import './songz-playlist-list.js';
import './songz-song-list.js';

export class SongZMainView extends LitElement {
	
	boundRoutingHandler = this.handleRouting.bind(this);
	
	static get properties() {
		return {
			view: { type: String, attribute: false },
			songList: { type: Array, attribute: false }
		};
	}
	
	constructor() {
		super();
		
		this.setAttribute('role', 'main');
	}
	
	/**
	 * @override
	 */
	connectedCallback() {
		super.connectedCallback();
		this.handleRouting();
		window.addEventListener('hashchange', this.boundRoutingHandler);
	}
	
	/**
	 * @override
	 */
	disconnectedCallback() {
		window.removeEventListener('hashchange', this.boundRoutingHandler);
		super.disconnectedCallback();
	}
	
	/**
	 * Handle routing based on the hash.
	 */
	async handleRouting() {
		this.mainView = 'loading';
		
		if (location.hash === '#home') {
			this.songList = await this.getAPI('songs');
			this.mainView = 'search'; // TODO: Replace this once home view exists
			
		} else if (location.hash.match(/^#albums\/[0-9a-f]+$/)) {
			let albumId = location.hash.match(/^#albums\/([0-9a-f]+)$/)[1],
				album = await this.getAPI(`albums/${albumId}`);
			this.songList = album.songs;
			this.mainView = 'search'; // TODO: Replace this once album view exists
			
		} else if (location.hash.match(/^#artists\/[0-9a-f]+$/)) {
			let artistId = location.hash.match(/^#artists\/([0-9a-f]+)$/)[1],
				artist = await this.getAPI(`artists/${artistId}`);
			this.songList = artist.songs;
			this.mainView = 'search'; // TODO: Replace this once artist view exists
			
		} else if (location.hash === '#songs') {
			this.mainView = 'search';
			
		} else if (location.hash === '#playlists') {
			this.mainView = 'playlists';
			
		} else {
			// If there is no valid route, send the user to the home view.
			location.hash = '#home';
		}
	}
	
	/**
	 * Get from a given API endpoint.
	 * @param {String} url - The URL for the API endpoint
	 * @returns {Promise<Array<Object>>} Resolves with the data and sorted list of songs
	 */
	async getAPI(url) {
		let apiRes = await fetch(`/api/${url}`),
			data = await apiRes.json();
		// TODO: Default sorting – album, then disc #, then track #
		return data;
	}
	
	/**
	 * @override
	 */
	render() {
		var mainViewContents;
		
		switch (this.mainView) {
			case 'playlists':
				mainViewContents = html`
					<songz-playlist-list></songz-playlist-list>
				`;
				break;
			case 'search':
				mainViewContents = html`
					<songz-song-list
						.songs="${this.songList}"
					</songz-song-list>
				`;
				break;
			default:
				mainViewContents = html`Loading...`;
				break;
		}
		
		return html`
			${mainViewContents}
		`;
	}
	
	/**
	 * @override
	 * Prevent the component having a shadow root.
	 */
	createRenderRoot() {
		return this;
	}
}

window.customElements.define('songz-main-view', SongZMainView);
