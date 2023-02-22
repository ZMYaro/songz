'use strict';

import {LitElement, html, css} from 'lit';
//import {LitElement, html, css} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {SIDE_PANE_WIDTH} from '../scripts/constants.js';

export class SongZSidePanel extends LitElement {
	
	tabBar;
	tabContents;
	
	static get styles() {
		return css`
			:host {
				height: 100%;
				display: flex;
				flex-direction: column;
			}
			mwc-tab-bar {
				flex: 0 0 auto;
				/* Make selected tabs the accent color instead of the primary color. */
				--mdc-theme-primary: var(--mdc-theme-secondary);
			}
			.tab-contents {
				flex-grow: 1;
				white-space: nowrap;
				overflow-x: auto;
				overflow-y: hidden;
				scroll-snap-type: x mandatory;
			}
				.tab-contents > * {
					display: inline-block;
					width: 100%;
					height: 100%;
					vertical-align: top;
					scroll-snap-align: start;
					scroll-snap-stop: always;
				}
				.tab-contents > songz-queue {
					display: inline-flex;
				}
		`;
	}
	
	static get properties() {
		return {
			songs: { type: Array, attribute: false },
			activeIndex: { type: Number, attribute: true }
		};
	}
	
	/**
	 * @override
	 * Get a reference to the tab sections when the element is first updated.
	 */
	firstUpdated() {
		this.tabBar = this.shadowRoot.querySelector('mwc-tab-bar');
		this.tabContents = this.shadowRoot.querySelector('.tab-contents');
	}
	
	/**
	 * Handle a tab being selected.
	 * @param {CustomEvent} ev
	 */
	handleTabSelect(ev) {
		this.tabContents.scrollTo((SIDE_PANE_WIDTH * ev.detail.index), 0);
	}
	
	/**
	 * Handle the tab contents being scrolled horizontally.
	 */
	handleTabContentsScroll() {
		// Floor instead of round to snap quickly to the left before it
		// can be treated as swiping the panel away in narrow window.
		this.tabBar.activeIndex = Math.floor(this.tabContents.scrollLeft / SIDE_PANE_WIDTH);
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-tab-bar @MDCTabBar:activated="${this.handleTabSelect}">
				<mwc-tab label="Queue"></mwc-tab>
				<mwc-tab label="Lyrics"></mwc-tab>
			</mwc-tab-bar>
			<div class="tab-contents" @scroll="${this.handleTabContentsScroll}">
				<songz-queue
					.songs="${this.songs}"
					activeIndex="${this.activeIndex}">
				</songz-queue>
				<songz-lyrics .song="${this.songs[this.activeIndex]}"></songz-lyrics>
			</div>
		`;
	}
}

window.customElements.define('songz-side-panel', SongZSidePanel);
