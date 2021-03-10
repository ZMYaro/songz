'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@polymer/app-layout'; // Needed for <app-drawer> and <app-drawer-layout>.
import 'https://unpkg.com/@polymer/app-layout@3.1.0/app-layout.js?module';

import './songz-queue.js';
import './songz-player.js';
import './songz-main-view.js';
import {formatArtist, toGDriveURL} from '../scripts/utils.js';

export class SongZApp extends LitElement {
	
	activePlayer;
	inactivePlayer;
	mainView;
	
	static get properties() {
		return {
			playStatus: { type: String, attribute: false },
			currentTime: { type: Number, attribute: false },
			duration: { type: Number, attribute: false },
			queue: { type: Array, attribute: false },
			queuePosition: { type: Number, attribute: false }
		};
	}
	
	constructor() {
		super();
		
		this.queue = [];
		this.queuePosition = -1;
	}
	
	/**
	 * @override
	 * Set up audio player elements when the component is first updated.
	 */
	firstUpdated() {
		// Apply theming to old Polymer drawer.
		this.querySelector('app-drawer').shadowRoot.getElementById('contentContainer').style.backgroundColor = 'var(--mdc-theme-surface)';
		
		// Get reference to main view.
		this.mainView = this.querySelector('songz-main-view');
		
		// Set up audio players.
		this.activePlayer = new Audio();
		this.inactivePlayer = new Audio();
		this.activePlayer.addEventListener('timeupdate', this.handlePlayerTimeChange.bind(this));
		this.inactivePlayer.addEventListener('timeupdate', this.handlePlayerTimeChange.bind(this));
		this.activePlayer.addEventListener('ended', this.nextSong.bind(this));
		this.inactivePlayer.addEventListener('ended', this.nextSong.bind(this));
		
		// Set up media session handlers.
		navigator.mediaSession.setActionHandler('play', this.resumeSong.bind(this));
		navigator.mediaSession.setActionHandler('pause', this.pauseSong.bind(this));
		navigator.mediaSession.setActionHandler('stop', this.stopSong.bind(this));
		navigator.mediaSession.setActionHandler('seekbackward', this.stepBackward.bind(this));
		navigator.mediaSession.setActionHandler('seekforward', this.stepForward.bind(this));
		navigator.mediaSession.setActionHandler('previoustrack', this.prevSong.bind(this));
		navigator.mediaSession.setActionHandler('nexttrack', this.nextSong.bind(this));
		navigator.mediaSession.setActionHandler('seekto', (details) => {
			this.activePlayer.currentTime = details.seekTime;
			this.updateSessionPositionState();
		});
	}
	
	/**
	 * Load a song's audio to play.
	 * @param {HTMLAudioELement} player - The player to load the song in
	 * @param {Object} song - The song's metadata
	 */
	loadSong(player, song) {
		player.innerHTML = '' +
			song.gDriveFLAC ? `<source src="${toGDriveURL(song.gDriveFLAC)}" type="audio/flac" />` : '' +
			song.gDriveM4A  ? `<source src="${toGDriveURL(song.gDriveM4A)}"  type="audio/x-m4a"  />` : '' +
			song.gDriveMP3  ? `<source src="${toGDriveURL(song.gDriveMP3)}"  type="audio/mp3"  />` : '' +
			song.gDriveOGG  ? `<source src="${toGDriveURL(song.gDriveOGG)}"  type="audio/ogg"  />` : '';
		player.load();
	}
	
	/**
	 * Swap the active and inactive players.
	 */
	swapPlayers() {
		let temp = this.activePlayer;
		this.activePlayer = this.inactivePlayer;
		this.inactivePlayer = temp;
	}
	
	/**
	 * Play a song from the queue if it is not already playing.
	 * @param {Number} i - The index from the queue to play
	 * @returns {Promise} Resolves when the song starts playing
	 */
	async playSong(i) {
		if (this.queuePosition === i) {
			// Do not reload if the selected song is already playing.
			await this.resumeSong();
			return;
		}
		this.loadSong(this.activePlayer, this.queue[i]);
		if (i + 1 < this.queue.length) {
			this.loadSong(this.inactivePlayer, this.queue[i + 1]);
		}
		this.queuePosition = i;
		await this.resumeSong();
	}
	
	/**
	 * Play the song if it is paused, or vice versa.
	 */
	playPauseSong() {
		if (this.playStatus === 'paused') {
			this.resumeSong();
		} else {
			this.pauseSong();
		}
	}
	/**
	 * Play the current player.
	 * @returns {Promise} Resolves when the song starts playing
	 */
	async resumeSong() {
		navigator.mediaSession.playbackState = 'none';
		this.playStatus = 'buffering';
		this.duration = null;
		await this.activePlayer.play();
		navigator.mediaSession.playbackState = 'playing';
		this.currentTime = this.activePlayer.currentTime;
		this.duration = this.activePlayer.duration;
		this.updateSessionMetadata();
		this.updateSessionPositionState();
		this.playStatus = 'playing';
	}
	/**
	 * Pause the current player.
	 * @returns {Promise} Resolves when the song is paused.
	 */
	async pauseSong() {
		await this.activePlayer.pause();
		navigator.mediaSession.playbackState = 'paused';
		this.playStatus = 'paused';
	}
	/**
	 * Pause the current player and return to the start of the song.
	 * @returns {Promise} Resolves when the song is stopped and back at the start.
	 */
	async stopSong() {
		await this.pauseSong();
		this.activePlayer.currentTime = 0;
	}
	/**
	 * Seek backward 10 seconds in the current song.
	 */
	stepBackward() {
		this.activePlayer.currentTime -= 10;
		this.updateSessionPositionState();
	}
	/**
	 * Seek forward 10 seconds in the current song.
	 */
	stepForward() {
		this.activePlayer.currentTime += 10;
		this.updateSessionPositionState();
	}
	/**
	 * Move to the previous song in the queue, if any.
	 * @returns {Promise} Resolves when the previous song starts playing, or immediately if there is no previous song.
	 */
	async prevSong() {
		if (this.queuePosition - 1 < 0) {
			// Abort if there is no previous song.
			return;
		}
		// Stop the current song and switch players so it is ready if the queue steps forward.
		await this.stopSong();
		this.swapPlayers();
		// Step the queue position back.
		this.queuePosition--;
		// Load the now-current song and play when ready.
		this.loadSong(this.activePlayer, this.queue[this.queuePosition]);
		await this.resumeSong();
	}
	/**
	 * Move to the next song in the queue, if any.
	 * @returns {Promise} Resolves when the next song starts playing, or immediately if ithere is no next song.
	 */
	async nextSong() {
		if (this.queuePosition + 1 >= this.queue.length) {
			// Abort if there is no next song.
			return;
		}
		// Stop the current song and switch to the player where the next song is preloaded.
		await this.pauseSong();
		this.swapPlayers();
		// Step the queue position forward.
		this.queuePosition++;
		// Start preloading the next song (if any) and play the now-current one.
		if (this.queuePosition + 1 < this.queue.length) {
			this.loadSong(this.inactivePlayer, this.queue[this.queuePosition + 1]);
		}
		await this.resumeSong();
	}
	
	/**
	 * Move a song ahead of the currently playing song in the queue.
	 * @param {NUmber} i - The index from the queue to move
	 */
	moveSongNext(i) {
		// Pull the song out of the queue.
		var song = this.queue.splice(i, 1)[0];
		// Insert it at the new position.
		this.queue.splice(this.queuePosition + 1, 0, song);
		// Load it as the next song.
		this.loadSong(this.inactivePlayer, this.queue[this.queuePosition + 1]);
		
		// Reassign the array so it will rerender.
		this.queue = [...this.queue];
	}
	
	/**
	 * Remove a song from the queue and play the next song if it was playing.
	 * @param {Number} i - The index from the queue to remove
	 * @returns {Promise} Resolves when the removed song has been removed and is not playing, but does not wait for the next song to begin playing
	 */
	async removeSongFromQueue(i) {
		// Remove the song.
		this.queue.splice(i, 1);
		
		// If the song was playing, go to the next song.
		if (i === this.queuePosition) {
			await this.pauseSong();
			this.queuePosition--;
			this.nextSong();
		}
		
		// Rerender after modifying the array.
		this.requestUpdate();
	}
	
	/**
	 * Update the player and media session in response to the seek bar being moved.
	 * @param {Event} ev
	 */
	handleSeek(ev) {
		this.activePlayer.currentTime = ev.currentTarget.currentTime;
		this.updateSessionPositionState();
	}
	/**
	 * Update the UI and media session in response to the player playing.
	 * @param {Event} ev
	 */
	handlePlayerTimeChange(ev) {
		this.currentTime = ev.currentTarget.currentTime;
		this.updateSessionPositionState();
	}
	/**
	 * Update the media session with the current song's metadata.
	 */
	updateSessionMetadata() {
		var song = this.queue[this.queuePosition];
		
		navigator.mediaSession.metadata = new MediaMetadata({
			title: song.title,
			artist: formatArtist(song, true),
			artwork: [{
				src: (song.gDriveArt ? toGDriveURL(song.gDriveArt) : '/images/unknown_album.svg') 
			}]
		});
	}
	/**
	 * Update the media session's position state with the player's state.
	 */
	updateSessionPositionState() {
		if (!this.activePlayer.duration) {
			return;
		}
		navigator.mediaSession.setPositionState({
			duration: this.activePlayer.duration,
			playbackRate: this.activePlayer.playbackRate,
			position: this.activePlayer.currentTime
		});
	}
	
	/**
	 * @override
	 */
	render() {
		return html`
			<app-drawer-layout>
				<app-drawer slot="drawer" align="end" swipe-open>
					<h2>Queue</h2>
					<songz-queue
						.songs="${this.queue}"
						activeIndex="${this.queuePosition}"
						@queue-play-now="${(ev) => this.playSong(parseInt(ev.detail))}"
						@queue-play-next="${(ev) => this.moveSongNext(parseInt(ev.detail))}"
						@queue-remove="${(ev) => this.removeSongFromQueue(parseInt(ev.detail))}">
					</songz-queue>
				</app-drawer>
				<songz-main-view
					@play-now="${(ev) => {this.queue = this.mainView.songList; this.queuePosition = -1; this.playSong(parseInt(ev.detail));}}">
				</songz-main-view>
			</app-drawer-layout>
			<songz-player
				playing="${navigator.mediaSession.playbackState === 'playing'}"
				status="${this.playStatus}"
				currenttime="${this.currentTime}"
				duration="${this.duration}"
				@previous="${this.prevSong}"
				@stepbackward="${this.stepBackward}"
				@playpause="${this.playPauseSong}"
				@stepforward="${this.stepForward}"
				@next="${this.nextSong}"
				@seek="${this.handleSeek}">
			</songz-player>
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

window.customElements.define('songz-app', SongZApp);
