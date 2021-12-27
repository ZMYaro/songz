'use strict';

//import {LitElement, html, css}, css from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {toGDriveURL} from '../scripts/utils.js';

export class SongZLyrics extends LitElement {
	
	static get styles() {
		return css`
			:host {
				text-align: left;
			}
		`;
	}
	
	static get properties() {
		return {
			song: { type: Object, attribute: false },
			lyrics: { type: String, attribute: false }
		};
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			TODO: Lyrics
		`;
	}
}

window.customElements.define('songz-lyrics', SongZLyrics);
