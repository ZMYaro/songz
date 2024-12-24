'use strict';

import {LitElement, html} from 'lit';
//import {LitElement, html} from 'https://unpkg.com/lit@2.6.1/index.js?module';

export class SongZSongContextMenu extends LitElement {
	
	menu;
	
	static get properties() {
		return {
			viewtype: { type: String, reflect: true }, /* album, artist, composer, genre, queue, playlist, null */
			anchor: { type: Object, attribute: false },
			song: { type: Object, attribute: false },
			songIndex: { type: Number }
		};
	}
	
	/**
	 * @override
	 * Get a reference to the song menu when the element is first updated.
	 */
	firstUpdated() {
		this.menu = this.querySelector('mwc-menu');
	}
	
	/**
	 * Show the menu.
	 */
	show() {
		this.menu.show();
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<mwc-menu fixed wrapFocus .anchor="${this.anchor}">
				<!-- Play/queue actions -->
				${this.viewtype === 'queue' ?
					html`<mwc-list-item graphic="icon" value="queue-play-now">
						<mwc-icon slot="graphic">play_arrow</mwc-icon>
						Play
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="queue-play-next">
						<mwc-icon slot="graphic" style="transform: scaleY(-1);">playlist_play</mwc-icon>
						Queue next
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="queue-remove">
						<mwc-icon slot="graphic">playlist_remove</mwc-icon>
						Remove from queue
					</mwc-list-item>` :
					html`<mwc-list-item graphic="icon" value="play-song-now">
						<mwc-icon slot="graphic">play_arrow</mwc-icon>
						Play
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="play-song-next">
						<mwc-icon slot="graphic" style="transform: scaleY(-1);">playlist_play</mwc-icon>
						Queue next
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="add-song-to-queue">
						<mwc-icon slot="graphic">playlist_play</mwc-icon>
						Queue at end
					</mwc-list-item>`
				}
				<li divider role="separator"></li>
				<!-- Library actions -->
				<mwc-list-item graphic="icon" value="edit-song">
					<mwc-icon slot="graphic">edit</mwc-icon>
					Edit song...
				</mwc-list-item>
				<mwc-list-item graphic="icon" hasMeta value="add-to-playlist">
					<mwc-icon slot="graphic">playlist_add</mwc-icon>
					Add to playlist...
				</mwc-list-item>
				<li divider role="separator"></li>
				<!-- Navigation actions -->
				${this.viewtype !== 'album' && this.song?.album ?
					html`<mwc-list-item graphic="icon" value="open-album">
						<mwc-icon slot="graphic">album</mwc-icon>
						Go to album
					</mwc-list-item>` : ''
				}
				${this.viewtype !== 'artist' && this.song?.artist?.length ?
					html`<mwc-list-item graphic="icon" value="open-artist">
						<mwc-icon slot="graphic">person</mwc-icon>
						<!--<mwc-icon slot="graphic">account_music</mwc-icon>-->
						Go to artist
					</mwc-list-item>` : ''
				}
				<!-- GDrive links -->
				${this.song?.gDriveFLAC ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveFLAC}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<mwc-icon slot="graphic">audio_file</mwc-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open FLAC
						</mwc-list-item>
					</a>` : ''
				}
				${this.song?.gDriveM4A ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveM4A}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<mwc-icon slot="graphic">audio_file</mwc-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open M4A
						</mwc-list-item>
					</a>` : ''
				}
				${this.song?.gDriveMP3 ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveMP3}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<mwc-icon slot="graphic">audio_file</mwc-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open MP3
						</mwc-list-item>
					</a>` : ''
				}
				${this.song?.gDriveOgg ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveOgg}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<mwc-icon slot="graphic">audio_file</mwc-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open Ogg
						</mwc-list-item>
					</a>` : ''
				}
				${this.song?.gDriveArt ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveArt}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<songz-icon slot="graphic" icon="file_image"></songz-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open art
						</mwc-list-item>
					</a>` : ''
				}
				${this.song?.gDriveLRC ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveLRC}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<mwc-icon slot="graphic">description</mwc-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open LRC
						</mwc-list-item>
					</a>` : ''
				}
				${this.song?.gDriveMD ?
					html`<a href="https://drive.google.com/open?id=${this.song.gDriveMD}" target="_blank" style="text-decoration: none;">
						<mwc-list-item graphic="icon" hasMeta>
							<mwc-icon slot="graphic">description</mwc-icon>
							<mwc-icon slot="meta">open_in_new</mwc-icon>
							Open markdown
						</mwc-list-item>
					</a>` : ''
				}
			</mwc-menu>
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

window.customElements.define('songz-song-context-menu', SongZSongContextMenu);
