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
			form {
				max-width: 600px;
				padding: 4px;
			}
			input[type="text"] {
				width: calc(100% - 1em);
			}
			button[type="submit"] {
				float: right;
				margin-right: 1em;
				margin-bottom: 1em;
			}
		`;
	}
	
	static get properties() {
		return {
			pending: { type: Boolean, attribute: false },
			songs: { type: Array, attribute: false },
			message: { type: String, attribute: false }
		};
	}
	
	/**
	 * Update the page title when switched to the view.
	 */
	constructor() {
		super();
		setPageTitle('Generate playlist');
	}
	
	/**
	 * Turn the form field entries into a request for a playlist.
	 * @param {SubmitEvent} ev
	 */
	async generateList(ev) {
		ev.preventDefault();
		
		var formData = new FormData(ev.currentTarget),
			urlParams = new URLSearchParams(formData),
			url = `/api/generatelist?${urlParams}`;
		
		this.pending = true;
		try {
			var listRes = await fetch(url);
			await httpToJSError(listRes);
			this.songs = await listRes.json();
		} catch (err) {
			this.message = err;
		} finally {
			this.pending = false;
		}
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<songz-main-top-bar selected="generatelist"></songz-main-top-bar>
			<form method="GET" @submit="${this.generateList}">
				<fieldset .disabled="${this.pending}">
					<legend>Parameters for generated playlist</legend>
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
				</fieldset>
			</form>
			${this.pending ? html`<p><mwc-circular-progress indeterminate></mwc-circular-progress></p>` : ''}
			${this.message ? html`<p>${this.message}</p>` : ''}
		`;
	}
}

window.customElements.define('songz-generate-list-form', SongZGenerateListForm);
