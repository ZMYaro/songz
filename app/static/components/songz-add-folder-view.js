'use strict';

import {LitElement, html, css} from 'lit';

import {formatAlbum, formatArtist} from '../scripts/utils.js';

export class SongZAddFolderView extends LitElement {
	
	static get styles() {
		return css`
			fieldset {
				border: 0;
				min-width: auto;
				overflow-x: auto;
			}
			input[name^="disc-no"],
			input[name^="track-no"] {
				width: 2em;
			}
			input[name^="duration"] {
				width: 6em;
			}
			button[type="submit"] {
				float: right;
				margin: 1em;
			}
			audio {
				max-height: 1.25em;
			}
		`;
	}
	
	static get properties() {
		return {
			songs: { type: Array, attribute: false }
		};
	}
	
	/**
	 * @override
	 */
	render() {
		if (!this.songs) {
			return html``;
		}
		return html`
			<form method="POST" action="/api/songs/multi">
				<fieldset>
					<table>
						<thead>
							<tr>
								<th>📄 GDrive FLAC</th>
								<th>📄 GDrive M4A</th>
								<th>📄 GDrive MP3</th>
								<th>📄 GDrive Ogg</th>
								<th>🖼 GDrive Art</th>
								<th>📃 GDrive LRC</th>
								<th>📃 GDrive MD</th>
								<th>🔢 Disc #</th>
								<th>🔢 Track #</th>
								<th>🆎 Title</th>
								<th>🕓 Duration <small>(in milliseconds)</small></th>
								<th>🎹 Genre</th>
								<th>🧑‍🎤 Artist(s) <small>(semicolon-separated)</small></th>
								<th>👤 Composer(s) <small>(semicolon-separated)</small></th>
								<th>💿 Album title</th>
								<th>🧑‍🎤 Album artist</th>
								<th>📅 Year</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${this.songs.map((song, i) => html`
								<tr>
									<td><input type="text"   name="gdrive-flac${i}"  .value="${song.gDriveFLAC  || ''}" /></td>
									<td><input type="text"   name="gdrive-m4a${i}"   .value="${song.gDriveM4A   || ''}" /></td>
									<td><input type="text"   name="gdrive-mp3${i}"   .value="${song.gDriveMP3   || ''}" /></td>
									<td><input type="text"   name="gdrive-ogg${i}"   .value="${song.gDriveOgg   || ''}" /></td>
									<td><input type="text"   name="gdrive-art${i}"   .value="${song.gDriveArt   || ''}" /></td>
									<td><input type="text"   name="gdrive-lrc${i}"   .value="${song.gDriveLRC   || ''}" /></td>
									<td><input type="text"   name="gdrive-md${i}"    .value="${song.gDriveMD    || ''}" /></td>
									<td><input type="number" name="disc-no${i}"      .value="${song.discNo      || ''}" /></td>
									<td><input type="number" name="track-no${i}"     .value="${song.trackNo     || ''}" /></td>
									<td><input type="text"   name="title${i}"        .value="${song.title       || ''}" /></td>
									<td><input type="number" name="duration${i}" step="0.1" .value="${song.duration || ''}" /></td>
									<td><input type="text"   name="genre${i}"        .value="${song.genre       || ''}" /></td>
									<td><input type="text"   name="artist${i}"       .value="${song.artist      || ''}" /></td>
									<td><input type="text"   name="composer${i}"     .value="${song.composer    || ''}" /></td>
									<td><input type="text"   name="album-title${i}"  .value="${song.albumTitle  || ''}" /></td>
									<td><input type="text"   name="album-artist${i}" .value="${song.albumArtist || ''}" /></td>
									<td><input type="number" name="year${i}" min="1000" max="9999" .value="${song.year || ''}" /></td>
									<td>
										${song.gDriveFLAC ? html`<audio src="${song.gDriveFLACURL}" controls="controls"></audio>` : ''}
										${song.gDriveM4A ?  html`<audio src="${song.gDriveM4AURL}" controls="controls"></audio>` : ''}
										${song.gDriveMP3 ?  html`<audio src="${song.gDriveMP3URL}" controls="controls"></audio>` : ''}
										${song.gDriveOgg ?  html`<audio src="${song.gDriveOggURL}" controls="controls"></audio>` : ''}
									</td>
								</tr>
							`)}
						</tbody>
					</table>
				</fieldset>
				<button type="submit">Submit</button>
			</form>
		`;
	}
}

window.customElements.define('songz-add-folder-view', SongZAddFolderView);
