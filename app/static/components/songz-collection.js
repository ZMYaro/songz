'use strict';

import './songz-filter-dialog.js';

import {LitElement, html, css} from 'lit';

import {handleMenuItemSelect, haveCommonElements, httpToJSError, parseSemicolonSeparatedList, setPageTitle} from '../scripts/utils.js';

export class SongZCollection extends LitElement {
	/** @constant {String} */
	VIEW_TYPE;
	/** @constant {String} The API endpont to fetch this collection's songs, to which the `collectionid` will be appended */
	API_ENDPOINT;
	
	/** {AbortController} Abort controller for fetching the collection's songs */
	loadAbortController;
	/** {SongZFilterDialog} The list's filter dialog */
	filterDialog;
	/** {SongzCollectionActionsMenu} The collection view's action bar menu */
	actionsMenu;
	
	boundApplyFilters;
	
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
			filters: { type: Object, attribute: false },
			pending: { type: Boolean, attribute: false },
			songs: { type: Array, attribute: false },
			filteredSongs: { type: Array, state: true }
		};
	}
	
	constructor() {
		super();
		this.boundApplyFilters = this.applyFilters.bind(this);
	}
	
	/**
	 * @override
	 * Get a reference to the action menu when the component is first updated.
	 */
	firstUpdated() {
		this.actionsMenu = this.shadowRoot.querySelector('songz-collection-actions-menu');
		this.actionsMenu.anchor = this.shadowRoot.querySelector('mwc-top-app-bar-fixed mwc-icon-button[icon="more_vert"]');
		this.filterDialog = this.shadowRoot.querySelector('songz-filter-dialog');
	}
	
	/**
	 * @override
	 * Handle `collectionid`, `filters`, or `songs` changing.
	 * @param {Map} changedProperties - Names of changed properties to corresponding previous values
	 */
	willUpdate(changedProperties) {
		if (changedProperties.has('collectionid') && changedProperties.get('collectionid') !== this.collectionid) {
			// Load the new collection if the ID changed.
			this.loadSongs();
		}
		if (changedProperties.has('filters') || changedProperties.has('songs')) {
			// Update the filtered songs list if `songs` or `filters` changed.
			this.filteredSongs = (this.songs || []).filter(this.boundApplyFilters);
		}
	}
	
	/**
	 * Abort loading on disconnect.
	 */
	disconnectedCallback() {
		this.loadAbortController.abort();
	}
	
	/**
	 * Apply the set filters.
	 * @param song - The current song being filtered
	 */
	applyFilters(song) {
		if (!this.filters) { return true; }
		
		const filterOut =
			(this.filters.minDuration &&
				song.duration < this.filters.minDuration) ||
			(this.filters.maxDuration &&
				song.duration > this.filters.maxDuration) ||
			(this.filters.genre &&
				!parseSemicolonSeparatedList(this.filters.genre).includes(song.genre?.name)) ||
			(this.filters.artist &&
				!haveCommonElements(
					parseSemicolonSeparatedList(this.filters.artist),
					song.artist?.map((artist) => artist.name) || [])) ||
			(this.filters.composer &&
				!haveCommonElements(
					parseSemicolonSeparatedList(this.filters.composer),
					song.composer?.map((composer) => composer.name) || [])) ||
			(this.filters.minYear &&
				song.year < parseInt(this.filters.minYear)) ||
			(this.filters.maxYear &&
				song.year > parseInt(this.filters.maxYear)) ||
			(typeof this.filters.minRating !== 'undefined' &&
				(song.rating || 0) < parseInt(this.filters.minRating));
		return !filterOut;
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
	 * Handle the filter settings getting updated.
	 * @param {CustomEvent} ev
	 */
	handleFilterChange(ev) {
		this.filters = ev.detail.filters;
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
		handleMenuItemSelect(ev, this.filteredSongs, this);
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-icon-button icon="arrow_back" slot="navigationIcon" @click="${() => location.href = `#${this.VIEW_TYPE}s`}"></mwc-icon-button>
				<span role="heading" aria-level="1" slot="title">${this.title || ''}</span>
				<mwc-icon-button icon="filter_list" title="Filter..." slot="actionItems" @click="${() => this.filterDialog.show()}"></mwc-icon-button>
				<mwc-icon-button icon="more_vert" title="More actions" slot="actionItems" @click="${() => this.actionsMenu.show()}"></mwc-icon-button>
			</mwc-top-app-bar-fixed>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
			${this.filteredSongs ? html`<songz-song-list viewtype="${this.VIEW_TYPE}" .songs="${this.filteredSongs || []}" .filters="${this.filters || {}}"></songz-song-list>` : ''}
			<songz-collection-actions-menu viewtype="${this.VIEW_TYPE}" @action="${this.handleMenuItemSelect}"></songz-collection-actions-menu>
			<songz-filter-dialog @change="${this.handleFilterChange}"></songz-filter-dialog>
		`;
	}
}
