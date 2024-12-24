'use strict';

import {LitElement, html} from 'lit';
//import {LitElement, html} from 'https://unpkg.com/lit@2.6.1/index.js?module';

export class SongZCollectionActionsMenu extends LitElement {
	
	menu;
	
	static get properties() {
		return {
			viewtype: { type: String, reflect: true }, /* album, artist, genre, playlist */
			anchor: { type: Object, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Get a reference to the song menu when the element is first updated.
	 */
	firstUpdated() {
		this.menu = this.querySelector('mwc-menu');
	}
	
	/**
	 * Show the menu.
	 */
	show() {
		this.menu.show();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-menu fixed wrapFocus menuCorner="END" corner="TOP_END" .anchor="${this.anchor}">
				<!-- Play/queue actions -->
				<mwc-list-item graphic="icon" value="play-collection-now">
					<mwc-icon slot="graphic">play_arrow</mwc-icon>
					Play all
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="shuffle-collection-now">
					<mwc-icon slot="graphic">shuffle</mwc-icon>
					Shuffle all
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="play-collection-next">
					<mwc-icon slot="graphic" style="transform: scaleY(-1);">playlist_play</mwc-icon>
					Queue all next
				</mwc-list-item>
				<mwc-list-item graphic="icon" value="add-collection-to-queue">
					<mwc-icon slot="graphic">playlist_play</mwc-icon>
					Queue all at end
				</mwc-list-item>
				<li divider role="separator"></li>
				<!-- Library actions -->
				<mwc-list-item graphic="icon" @click="${() => alert('Not yet implemented.')}">
					<mwc-icon slot="graphic">playlist_add</mwc-icon>
					Add all to playlist
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click="${() => alert('Not yet implemented.')}">
					<mwc-icon slot="graphic">edit</mwc-icon>
					Edit ${this.viewtype}
				</mwc-list-item>
			</mwc-menu>
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

window.customElements.define('songz-collection-actions-menu', SongZCollectionActionsMenu);
