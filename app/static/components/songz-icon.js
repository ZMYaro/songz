'use strict';

import {LitElement, html} from 'lit';

export class SongZIcon extends LitElement {
	
	static get properties() {
		return {
			icon: { type: String, reflect: true }
		};
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<svg role="img">
				<use xlink:href="/images/icons/${this.icon}.svg#icon" href="images/icons/${this.icon}.svg#icon"></use>
			</svg>
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

window.customElements.define('songz-icon', SongZIcon);
