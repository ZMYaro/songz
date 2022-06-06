'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZGenerateListForm extends LitElement {
	
	static get styles() {
		return css`
			label {
				display: block;
			}
		`;
	}
	
	/**
	 * Turn the form field entries into a request for a playlist.
	 * @param {SubmitEvent} ev
	 */
	handleFormSubmit(ev) {
		debugger;
		ev.preventDefault();
		alert('Not yet implemented.');
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="generatelist"></songz-main-top-bar>
			<form method="GET" @submit="${this.handleFormSubmit}">
				<label>
					Genre
					<br />
					<input type="text" name="genre" />
				</label>
				<label>
					Minimum rating
					<br />
					<input type="number" min="-3" max="3" value="1" />
				</label>
				<label>
					Number of tracks
					<br />
					<input type="number" min="1" max="100" value="20" />
				</label>
				<br />
				<button type="submit">Generate</button>
			</form>
		`;
	}
}

window.customElements.define('songz-generate-list-form', SongZGenerateListForm);
