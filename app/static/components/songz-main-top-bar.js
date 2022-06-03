'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

export class SongZMainTopBar extends LitElement {
	
	static get styles() {
		return css`
			mwc-tab-bar {
				--mdc-theme-primary: #ffffff;
				--mdc-tab-color-default: rgba(255, 255, 255, 0.54);
				--mdc-tab-horizontal-padding: 0px;
			}
		`;
	}
	
	static get properties() {
		return {
			selected: { type: String, reflect: true }
		};
	}
	
	/**
	 * @override
	 * Override tabs' hard-coded minimum width when the top bar is first updated.
	 */
	firstUpdated() {
		var tabStyleSheet = new CSSStyleSheet();
		tabStyleSheet.replaceSync('.mdc-tab { min-width: 56px; }');
		for (let tab of this.shadowRoot.querySelectorAll('mwc-tab')) {
			tab.shadowRoot.adoptedStyleSheets = [...tab.shadowRoot.adoptedStyleSheets, tabStyleSheet];
		}
	}
	
	/**
	 * @override
	 */
	render() {
		var activeIndex = ['artists', 'albums', 'songs', 'playlists'].indexOf(this.selected);
		return html`
			<mwc-top-app-bar-fixed>
				<mwc-tab-bar activeIndex="${activeIndex}" slot="navigationIcon">
					<mwc-tab icon="person" title="Artists" aria-label="Artists." @click="${() => location.href = '#artists'}"></mwc-tab>
					<mwc-tab icon="album" title="Albums" aria-label="Albums." @click="${() => location.href = '#albums'}"></mwc-tab>
					<mwc-tab icon="music_note" title="Songs" aria-label="Songs." @click="${() => location.href = '#songs'}"></mwc-tab>
					<mwc-tab icon="format_list_bulleted" title="Playlists" aria-label="Playlists." @click="${() => location.href = '#playlists'}"></mwc-tab>
				</mwc-tab-bar>
			</mwc-top-app-bar-fixed>
		`;
	}
}

window.customElements.define('songz-main-top-bar', SongZMainTopBar);
