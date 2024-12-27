'use strict';

import {LitElement, html, css} from 'lit';

import {handleMenuItemSelect, httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZCollection extends LitElement {
	/** @constant {String} */
	VIEW_TYPE;
	/** @constant {String} The API endpont to fetch this collection's songs, to which the `collectionid` will be appended */
	API_ENDPOINT;
	
	/** {AbortController} Abort controller for fetching the collection's songs */
	loadAbortController;
	/** {SongzCollectionActionsMenu} The collection view's action bar menu */
	actionsMenu;
	
	static get styles() {
		return css`
			p {
				text-align: center;
			}
		`;
	}
	
	static get properties() {
		return {
			collectionid: { type: String, reflect: true },
			collectionname: { type: String, reflect: true },
			message: { type: String, reflect: true },
			pending: { type: Boolean, attribute: false },
			songs: { type: Array, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Get a reference to the action menu when the component is first updated.
	 */
	firstUpdated() {
		this.actionsMenu = this.shadowRoot.querySelector('songz-collection-actions-menu');
		this.actionsMenu.anchor = this.shadowRoot.querySelector('mwc-top-app-bar-fixed mwc-icon-button[icon="more_vert"]');
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * @override
	 * Load the new collection if the ID is changed.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	updated(changedProperties) {
		if (changedProperties.has('collectionid') && changedProperties.get('collectionid') !== this.collectionid) {
			this.loadSongs();
		}
	}
	
	/**
	 * Load the collection.
	 * @returns {Promise} Resolves when the collection metadata and list of songs has been loaded and set to display
	 */
	async loadSongs() {
		setPageTitle('');
		this.message = undefined;
		this.songs = undefined;
		this.pending = true;
		this.loadAbortController = new AbortController();
		try {
			var collectionRes = await fetch(this.API_ENDPOINT + this.collectionid, { signal: this.loadAbortController.signal });
			await httpToJSError(collectionRes);
			var collection = await collectionRes.json();
			this.title = collection.title || collection.name;
			setPageTitle(this.title);
			this.message = collection.description || undefined;
			this.songs = collection.songs;
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
	 * Send an event in response to an action menu item being selected.
	 * @param {CustomEvent} ev - The onselected event from the menu
	 */
	handleMenuItemSelect(ev) {
		handleMenuItemSelect(ev, this.songs, this);
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = `#${this.VIEW_TYPE}s`}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.title || ''}</span>
				<mwc-icon-button icon="more_vert" slot="actionItems" @click="${() => this.actionsMenu.show()}"></mwc-icon-button>
			</mwc-top-app-bar-fixed>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.songs ? html`<songz-song-list viewtype="${this.VIEW_TYPE}" .songs="${this.songs}"></songz-song-list>` : ''}
			<songz-collection-actions-menu viewtype="${this.VIEW_TYPE}" @action="${this.handleMenuItemSelect}"></songz-collection-actions-menu>
		`;
	}
}
