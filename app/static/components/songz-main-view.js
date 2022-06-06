'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

export class SongZMainView extends LitElement {
	
	boundRoutingHandler = this.handleRouting.bind(this);
	
	static get styles() {
		return css`
			@media (min-width: 640px) {
				:host {
					--mdc-top-app-bar-width: calc(100% - var(--app-drawer-width));
				}
			}
			songz-album,
			songz-albums-list,
			songz-artist,
			songz-artists-list,
			songz-generate-list-form,
			songz-genre,
			songz-genres-list,
			songz-playlist,
			songz-playlists-list,
			songz-songs-list {
				display: block;
				height: 100%;
				overflow: auto;
			}
		`;
	}
	
	static get properties() {
		return {
			view: { type: String, attribute: false },
			viewContentId: { type: String, attribute: false },
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
		this.view = 'loading';
			
		if (location.hash === '#albums') {
			this.view = 'albums';
			
		} else if (location.hash.match(/^#albums\/[0-9a-f]+$/)) {
			this.view = 'album';
			this.viewContentId = location.hash.match(/^#albums\/([0-9a-f]+)$/)[1];
			
		} else if (location.hash === '#artists') {
			this.view = 'artists';
			
		} else if (location.hash.match(/^#artists\/[0-9a-f]+$/)) {
			this.view = 'artist';
			this.viewContentId = location.hash.match(/^#artists\/([0-9a-f]+)$/)[1];
			
		} else if (location.hash.match(/^#generatelist(\?.+)?$/)) {
			this.view = 'generatelist'
			
		} else if (location.hash === '#genres') {
			this.view = 'genres';
			
		} else if (location.hash.match(/^#genres\/[0-9a-f]+$/)) {
			this.view = 'genre';
			this.viewContentId = location.hash.match(/^#genres\/([0-9a-f]+)$/)[1];
			
		} else if (location.hash === '#songs') {
			this.view = 'songs';
			
		} else if (location.hash === '#playlists') {
			this.view = 'playlists';
			
		} else if (location.hash.match(/^#playlists\/[0-9a-f]+$/)) {
			this.view = 'playlist';
			this.viewContentId = location.hash.match(/^#playlists\/([0-9a-f]+)$/)[1];
			
		} else {
			// If there is no valid route, send the user to the albums view.
			location.hash = '#albums';
		}
	}
	
	/**
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.shadowRoot.firstElementChild?.handleMetadataUpdate?.();
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
		
		switch (this.view) {
			case 'album':
				mainViewContents = html`<songz-album albumid="${this.viewContentId}"></songz-album>`;
				break;
			case 'albums':
				mainViewContents = html`<songz-albums-list></songz-albums-list>`;
				break;
			case 'artist':
				mainViewContents = html`<songz-artist artistid="${this.viewContentId}"></songz-artist>`;
				break;
			case 'artists':
				mainViewContents = html`<songz-artists-list></songz-artists-list>`;
				break;
			case 'generatelist':
				mainViewContents = html`<songz-generate-list-form></songz-generate-list-form>`;
				break;
			case 'genre':
				mainViewContents = html`<songz-genre genreid="${this.viewContentId}"></songz-genre>`;
				break;
			case 'genres':
				mainViewContents = html`<songz-genres-list></songz-genres-list>`;
				break;
			case 'playlist':
				mainViewContents = html`<songz-playlist playlistid="${this.viewContentId}"></songz-playlist>`;
				break;
			case 'playlists':
				mainViewContents = html`<songz-playlists-list></songz-playlists-list>`;
				break;
			case 'search':
				mainViewContents = html`<songz-song-list .songs="${this.songList}"></songz-song-list>`;
				break;
			case 'songs':
				mainViewContents = html`<songz-songs-list></songz-songs-list>`;
				break;
			default:
				mainViewContents = html`Loading...`;
				break;
		}
		
		return html`
			${mainViewContents}
		`;
	}
}

window.customElements.define('songz-main-view', SongZMainView);
