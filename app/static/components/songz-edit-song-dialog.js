'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

import {formatAlbum, formatArtist} from '../scripts/utils.js';

export class SongZEditSongDialog extends LitElement {
	
	dialog;
	form;
	
	static get properties() {
		return {
			song: { type: Object, attribute: false },
			pending: { type: Boolean, attribute: false }
		};
	}
	
	/**
	 * @override
	 * Set up event listener to submit form.
	 */
	firstUpdated() {
		this.dialog = this.querySelector('mwc-dialog');
		this.form = this.querySelector('form');
		this.form.addEventListener('submit', this.handleSubmit.bind(this));
	}
	
	/**
	 * Show the dialog.
	 */
	show(song) {
		this.pending = false;
		this.song = song;
		this.dialog.show();
	}
	
	/**
	 * Handle submitting changes.
	 * @param {Event} ev
	 */
	async handleSubmit(ev) {
		ev.preventDefault();
		
		if (this.pending) {
			return;
		}
		
		this.pending = true;
		
		var formData = new FormData(this.form),
			reqBody = new URLSearchParams(formData),
			response = await fetch('/api/songs', {
				method: 'PUT',
				body: reqBody
			});
		
		if (!response.ok) {
			try {
				var errData = await response.json();
				alert('Error: ' + errData.error);
			} catch (err) {
				alert('An error occurred submitting the update to this song\'s metadata.');
			}
			this.pending = false;
			return;
		}
		
		try {
			// Update the song with the new data.
			var newSongData = await response.json();
			Object.assign(this.song, newSongData);
			// Close the dialog and tell the parent view to update.
			this.dialog.close();
			this.dispatchEvent(new CustomEvent('update-song', {
				bubbles: true,
				composed: true
			}));
			// Make Lit aware the data changed.
			// (If this is not done, any fields whose previous values match those of the next song
			// edited will be stuck on the values just entered because Lit sees them as unchanged.)
			this.requestUpdate();
		} catch (err) {
			alert('The updated metadata was submitted, but something was wrong with the updated song data returned by the server.');
			this.pending = false;
		}
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-dialog heading="Edit song" scrimClickAction="" escapeKeyAction="${this.pending ? '' : 'close'}">
				<form>
					<fieldset ?disabled="${this.pending}">
						<label>
							ID:
							<input type="text" .value="${this.song?._id}" disabled="disabled" />
							<input type="hidden" name="id" .value="${this.song?._id}" />
						</label>
						<label>
							📄 GDrive FLAC:
							<input type="text" name="gdrive-flac" .value="${this.song?.gDriveFLAC || ''}" />
						</label>
						<label>
							📄 GDrive M4A:
							<input type="text" name="gdrive-m4a" .value="${this.song?.gDriveM4A || ''}" />
						</label>
						<label>
							📄 GDrive MP3:
							<input type="text" name="gdrive-mp3" .value="${this.song?.gDriveMP3 || ''}" />
						</label>
						<label>
							📄 GDrive Ogg:
							<input type="text" name="gdrive-ogg" .value="${this.song?.gDriveOgg || ''}" />
						</label>
						<label>
							🖼 GDrive Art:
							<input type="text" name="gdrive-art" .value="${this.song?.gDriveArt || ''}" />
						</label>
						<label>
							📃 GDrive LRC:
							<input type="text" name="gdrive-lrc" .value="${this.song?.gDriveLRC || ''}" />
						</label>
						<label>
							🆎 Title:
							<input type="text" name="title" .value="${this.song?.title}" />
						</label>
						<label>
							🕓 Duration:
							<small>(in milliseconds)</small>
							<input type="number" name="duration" step="0.1" .value="${this.song?.duration}" />
						</label>
						<label>
							🎹 Genre:
							<input type="text" name="genre" .value="${this.song?.genre?.name || ''}" />
						</label>
						<label>
							🧑‍🎤 Artist(s):
							<small>(semicolon-separated)</small>
							<input type="text" name="artist" .value="${formatArtist(this.song, true)}" />
						</label>
						<label>
							👤 Composer(s):
							<small>(semicolon-separated)</small>
							<input type="text" name="composer" .value="${formatArtist({artist: this.song?.composer}, true)}" />
						</label>
						<label>
							💿 Album title:
							<input type="text" name="album-title" .value="${formatAlbum(this.song, true)}" />
						</label>
						<label>
							🧑‍🎤 Album artist:
							<input type="text" name="album-artist" .value="${formatArtist({artist: this.song?.album?.artist}, true)}" />
						</label>
						<label>
							🔢 Track #:
							<input type="number" name="track-no" .value="${this.song?.trackNo || ''}" />
						</label>
						<label>
							🔢 Disc #:
							<input type="number" name="disc-no" .value="${this.song?.discNo || ''}" />
						</label>
						<label>
							📅 Year:
							<input type="number" name="year" min="1000" max="9999" .value="${this.song?.year || ''}" />
						</label>
					</fieldset>
				</form>
				<mwc-button slot="secondaryAction" dialogAction="close" ?disabled="${this.pending}">Cancel</mwc-button>
				<mwc-button slot="primaryAction" unelevated ?disabled="${this.pending}" @click="${this.handleSubmit}">Save</mwc-button>
			</mwc-dialog>
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

window.customElements.define('songz-edit-song-dialog', SongZEditSongDialog);
