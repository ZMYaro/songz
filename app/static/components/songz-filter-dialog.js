'use strict';

import {LitElement, html, css} from 'lit/index.js';

import {httpToJSError, setPageTitle} from '../scripts/utils.js';

export class SongZFilterDialog extends LitElement {
	
	/** {Dialog} The MWC dialog component */
	dialog;
	
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
			button,
			input {
				font: inherit;
			}
			input[type="text"] {
				box-sizing: border-box;
				width: 100%;
			}
			#actions {
				display: flex;
				gap: 0.5em;
				margin-top: 1em;
			}
			button[type="reset"] {
				margin-right: auto;
			}
		`;
	}
	
	/**
	 * @override
	 * Get a reference to the dialog when the element is first updated.
	 */
	firstUpdated() {
		this.dialog = this.shadowRoot.querySelector('mwc-dialog');
		// Remove <mwc-dialog> #actions region outside form.
		requestAnimationFrame(() =>
			this.dialog.shadowRoot.getElementById('actions').style.display = 'none');
	}
	
	/**
	 * Format and send the updated filters.
	 * @param {SubmitEvent} ev - The filter form submit event
	 */
	dispatchChangeEvent(ev) {
		ev.preventDefault();
		
		// Convert the form data to a simple object map of the set filters.
		const formData = new FormData(ev.currentTarget);
		let filters = {};
		for (const [key, value] of formData.entries()) {
			if (!value) { continue; }
			
			const camelCasedKey = key.replace(/-(.)/g, (str, captureGroup) => captureGroup.toUpperCase());
			filters[camelCasedKey] = value;
		}
		
		this.dispatchEvent(new CustomEvent('change', {
			detail: {
				filters: filters
			},
			bubbles: true,
			composed: true
		}));
		
		this.dialog.close();
	}
	
	/**
	 * Show the dialog.
	 */
	show(song) {
		this.dialog.show();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-dialog heading="Filter" scrimClickAction="" escapeKeyAction="close">
				<form method="dialog" @submit="${this.dispatchChangeEvent}">
					<label>
						🕓 Duration:
						<small>(in milliseconds)</small>
						<br />
						<input name="min-duration" type="number" min="1" max="99999999" />
						-
						<input name="max-duration" type="number" min="1" max="99999999" />
					</label>
					<label>
						🎹 Genre(s):
						<small>(semicolon-separated)</small>
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
						<input name="min-rating" type="number" min="-3" max="3" />
					</label>
					<footer id="actions">
						<button type="reset" slot="secondaryAction">Clear</button>
						<button type="button" slot="secondaryAction" dialogAction="close">Cancel</button>
						<button type="submit" slot="primaryAction">Filter</button>
					</footer>
				</form>
			</mwc-dialog>
		`;
	}
}

window.customElements.define('songz-filter-dialog', SongZFilterDialog);
