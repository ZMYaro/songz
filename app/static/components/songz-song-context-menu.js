'use strict';

//import {LitElement, html} from 'lit-element';
import {LitElement, html} from 'https://unpkg.com/lit-element@2.5.1/lit-element.js?module';

export class SongZSongContextMenu extends LitElement {
	
	menu;
	
	static get properties() {
		return {
			viewtype: { type: String, reflect: true }, /* album, artist, composer, queue, playlist, null */
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
						<mwc-icon slot="graphic">playlist_play</mwc-icon>
						Play next
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="queue-remove">
						<mwc-icon slot="graphic">remove_circle</mwc-icon>
						Remove from queue
					</mwc-list-item>` :
					html`<mwc-list-item graphic="icon" value="play-now">
						<mwc-icon slot="graphic">play_arrow</mwc-icon>
						Play
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="play-next">
						<mwc-icon slot="graphic">playlist_play</mwc-icon>
						Play next
					</mwc-list-item>
					<mwc-list-item graphic="icon" value="add-to-queue">
						<mwc-icon slot="graphic">queue_music</mwc-icon>
						Add to queue
					</mwc-list-item>`
				}
				<li divider role="separator"></li>
				<!-- Library actions -->
				<mwc-list-item graphic="icon" value="edit-song">
					<mwc-icon slot="graphic">edit</mwc-icon>
					Edit song
				</mwc-list-item>
				<mwc-list-item graphic="icon" @click=${() => alert('Not yet implemented.')}>
					<mwc-icon slot="graphic">playlist_add</mwc-icon>
					Add to playlist
				</mwc-list-item>
				<li divider role="separator"></li>
				<!-- Navigation actions -->
				${this.viewtype !== 'album' ?
					html`<mwc-list-item graphic="icon" value="open-album">
						<mwc-icon slot="graphic">album</mwc-icon>
						Go to album
					</mwc-list-item>` : ''
				}
				${this.viewtype !== 'artist' ?
					html`<mwc-list-item graphic="icon" value="open-artist">
						<mwc-icon slot="graphic">person</mwc-icon>
						<!--<mwc-icon slot="graphic">account_music</mwc-icon>-->
						Go to artist
					</mwc-list-item>` : ''
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
