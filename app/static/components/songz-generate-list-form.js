'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZGenerateListForm extends LitElement {
	
	static get styles() {
		return css`
			label {
				display: block;
				margin-bottom: 0.25em;
			}
			input[type="text"] {
				width: 600px;
				max-width: 96%;
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
					🕓 Duration:
					<small>(in milliseconds)</small>
					<br />
					<input name="min-duration" type="number" min="1" max="99999999" />
					-
					<input name="max-duration" type="number" min="1" max="99999999" />
				</label>
				<label>
					🎹 Genre:
					<br />
					<input name="genre" type="text" />
				</label>
				<label>
					🧑‍🎤 Artist(s):
					<small>(semicolon-separated)</small>
					<br />
					<input name="artist" type="text" />
				</label>
				<label>
					👤 Composer(s):
					<small>(semicolon-separated)</small>
					<br />
					<input name="composer" type="text" />
				</label>
				<label>
					📅 Year:
					<br />
					<input name="min-year" type="number" min="1000" max="9999" />
					-
					<input name="max-year" type="number" min="1000" max="9999" />
				</label>
				<label>
					👍 Minimum rating:
					<br />
					<input name="min-rating" type="number" min="-3" max="3" value="1" />
				</label>
				<label>
					🧮 Number of tracks:
					<br />
					<input name="count" type="number" min="1" max="100" value="20" />
				</label>
				<br />
				<button type="submit">Generate</button>
			</form>
		`;
	}
}

window.customElements.define('songz-generate-list-form', SongZGenerateListForm);
