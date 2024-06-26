'use strict';

import {LitElement, html, css} from 'lit';
//import {LitElement, html, css} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {formatArtist, shuffle, toGDriveURL} from '../scripts/utils.js';

export class SongZApp extends LitElement {
	
	PLAYTHROUGH_STATUS_NOT_COUNTED = 0;
	PLAYTHROUGH_STATUS_SUBMITTED_PENDING = 1;
	PLAYTHROUGH_STATUS_SUBMITTED_SAVED = 2;
	
	activePlayer;
	inactivePlayer;
	mainView;
	sidePanel;
	editSongDialog;
	addToPlaylistDialog;
	playthroughStatus = 0;
	
	static get properties() {
		return {
			playStatus: { type: String, attribute: false },
			currentTime: { type: Number, attribute: false },
			duration: { type: Number, attribute: false },
			queue: { type: Array, attribute: false },
			queuePosition: { type: Number, attribute: false }
		};
	}
	
	/** {Boolean} Whether enough of the song has been played to count it as played */
	get isActiveSongSufficientlyPlayed() {
		/** {Number} The amount of the song that has to have been played to count the song as played, in seconds */
		const PLAYTHROUGH_MIN_TIME = 30;
		/** {Number} The fraction of the song that has to have been played to count the song as played */
		const PLAYTHROUGH_MIN_FRACTION = 0.99;
		
		var secondsPlayed = 0;
		for (let i = 0; i < this.activePlayer.played.length; i++) {
			secondsPlayed = (this.activePlayer.played.end(i) - this.activePlayer.played.start(i));
		}
		
		var enoughTimePlayed = (secondsPlayed > PLAYTHROUGH_MIN_TIME),
			enoughFractionPlayed = ((secondsPlayed / this.activePlayer.duration) > PLAYTHROUGH_MIN_FRACTION);
		return (enoughTimePlayed || enoughFractionPlayed);
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
		
		// Get references to views.
		this.mainView = this.querySelector('songz-main-view');
		this.sidePanel = this.querySelector('songz-side-panel');
		this.editSongDialog = this.querySelector('songz-edit-song-dialog');
		this.addToPlaylistDialog = this.querySelector('songz-add-to-playlist-dialog');
		
		// Set up audio players.
		this.activePlayer = new Audio();
		this.inactivePlayer = new Audio();
 		this.activePlayer.addEventListener('playing', this.handlePlay.bind(this));
		this.inactivePlayer.addEventListener('playing', this.handlePlay.bind(this));
		this.activePlayer.addEventListener('pause', this.handlePause.bind(this));
		this.inactivePlayer.addEventListener('pause', this.handlePause.bind(this));
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
			(song.gDriveFLAC ? `<source src="${toGDriveURL(song.gDriveFLAC)}" type="audio/flac" />` : '') +
			(song.gDriveM4A  ? `<source src="${toGDriveURL(song.gDriveM4A)}"  type="audio/x-m4a"  />` : '') +
			(song.gDriveMP3  ? `<source src="${toGDriveURL(song.gDriveMP3)}"  type="audio/mp3"  />` : '') +
			(song.gDriveOgg  ? `<source src="${toGDriveURL(song.gDriveOgg)}"  type="audio/ogg"  />` : '');
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
		this.playthroughStatus = this.PLAYTHROUGH_STATUS_NOT_COUNTED;
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
	 * Play the active player.
	 * @returns {Promise} Resolves when the song starts playing
	 */
	resumeSong() {
		navigator.mediaSession.playbackState = 'none';
		this.playStatus = 'buffering';
		this.duration = null;
		return this.activePlayer.play();
	}
	/**
	 * Handle the active player playing.
	 * @param {Event} ev
	 */
	handlePlay(ev) {
		if (ev.currentTarget !== this.activePlayer) { return; }
		navigator.mediaSession.playbackState = 'playing';
		this.currentTime = this.activePlayer.currentTime;
		this.duration = this.activePlayer.duration;
		this.updateSessionMetadata();
		this.updateSessionPositionState();
		this.playStatus = 'playing';
	}
	/**
	 * Pause the active player.
	 * @returns {Promise} Resolves when the song is paused.
	 */
	pauseSong() {
		return this.activePlayer.pause();
	}
	/*
	 * Handle the active player pausing.
	 * @param {Event} ev
	 */
	handlePause(ev) {
		if (ev.currentTarget !== this.activePlayer) { return; }
		navigator.mediaSession.playbackState = 'paused';
		this.playStatus = 'paused';
	}
	/**
	 * Pause the active player and return to the start of the song.
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
		// Reset the `played` ranges of the previously playing (now next) song.
		this.inactivePlayer.load();
		// Load the now-current song and play when ready.
		this.loadSong(this.activePlayer, this.queue[this.queuePosition]);
		this.playthroughStatus = this.PLAYTHROUGH_STATUS_NOT_COUNTED;
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
		this.playthroughStatus = this.PLAYTHROUGH_STATUS_NOT_COUNTED;
		await this.resumeSong();
	}
	
	/**
	 * Move a song ahead of the currently playing song in the queue.
	 * @param {NUmber} i - The index from the queue to move
	 */
	moveSongNext(i) {
		// Do not move the current song.
		if (i === this.queuePosition) {
			return;
		}
		// Pull the song out of the queue.
		var song = this.queue.splice(i, 1)[0];
		// Update the queue position if needed, and insert it at the new position.
		this.queuePosition = (i < this.queuePosition ? (this.queuePosition - 1) : this.queuePosition);
		this.queue.splice(this.queuePosition + 1, 0, song);
		// Preload it as the next song.
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
		
		// If the song was removed before the queue position, decrement the queue position.
		var oldQueuePosition = this.queuePosition;
		if (i <= this.queuePosition) {
			this.queuePosition--;
		}
		
		if (i === oldQueuePosition) {
			// If the song was playing, go to the next song.
			await this.pauseSong();
			this.nextSong();
		} else if (i === oldQueuePosition + 1 && this.queuePosition + 1 < this.queue.length) {
			// If the song was next, and not last, preload the new next song.
			this.loadSong(this.inactivePlayer, this.queue[this.queuePosition + 1]);
		}
		
		// Reassign the array so it will rerender.
		this.queue = [...this.queue];
	}
	
	/**
	 * Replace the queue with a new list of songs.
	 * @param {Array<Song>} songs - The list of song objects to add
	 * @param {Number} [startPosition] - The position in the new queue to play from (defaults to 0)
	 */
	replaceQueueWithSongs(songs, startPosition) {
		this.queue = [...songs];
		this.queuePosition = -1;
		this.playSong(startPosition || 0);
	}
	
	/**
	 * Add songs to the queue.
	 * @param {Array<Song>} songs - The list of song objects to add
	 * @param {Boolean} next - Whether the song should be added next, rather than at the end.
	 */
	addSongsToQueue(songs, next) {
		// Insert the song at the appropriate position.
		var insertionIndex = (next ? this.queuePosition + 1 : this.queue.length);
		this.queue.splice(insertionIndex, 0, ...songs);
		
		// If it was added next (explicitly or not), preload it.
		if (insertionIndex === this.queuePosition + 1) {
			this.loadSong(this.inactivePlayer, this.queue[this.queuePosition + 1]);
		}
		
		// Reassign the array so it will rerender.
		this.queue = [...this.queue];
	}
	
	/**
	 * Shuffle the queue ahead of the current song.
	 */
	shuffleUpcoming() {
		var remainingSongs = this.queue.slice(this.queuePosition + 1);
		shuffle(remainingSongs);
		this.queue.splice(this.queuePosition + 1, Infinity, ...remainingSongs);
		
		// Preload the new next song.
		this.loadSong(this.inactivePlayer, this.queue[this.queuePosition + 1]);
		
		// Reassign the array so it will rerender.
		this.queue = [...this.queue];
	}
	
	/**
	 * Submit the current playthrough to the database if it has not already.
	 * @param {Object} song - The song whose playthrough to record
	 * @returns {Promise} Resolves when the playthrough is saved, or immediately if this playthrough has already been saved.
	 */
	async savePlaythrough() {
		if (this.playthroughStatus !== this.PLAYTHROUGH_STATUS_NOT_COUNTED) {
			return;
		}
		var currentSongId = this.queue[this.queuePosition]._id;
		this.playthroughStatus = this.PLAYTHROUGH_STATUS_SUBMITTED_PENDING;
		await fetch(`/api/playthroughs/${currentSongId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: `timestamp=${(new Date()).getTime()}`
		});
		this.playthroughStatus = this.PLAYTHORUGH_STATUS_SUBMITTED_SAVED;
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
		if (this.playthroughStatus === this.PLAYTHROUGH_STATUS_NOT_COUNTED && this.isActiveSongSufficientlyPlayed) {
			// Start saving the playthrough if it is time; do not await its completion.
			this.savePlaythrough();
		}
	}
	
	/**
	 * Handle metadata getting updated.
	 */
	handleMetadataUpdate() {
		this.mainView.handleMetadataUpdate();
		this.sidePanel.handleMetadataUpdate();
	}
	
	/**
	 * Update the media session with the current song's metadata.
	 */
	updateSessionMetadata() {
		var song = this.queue[this.queuePosition];
		
		navigator.mediaSession.metadata = new MediaMetadata({
			title: song.title,
			artist: formatArtist(song, true),
			album: song.album?.title,
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
					<songz-side-panel
						.songs="${this.queue}"
						activeIndex="${this.queuePosition}"
						@queue-play-now="${(ev) => this.playSong(ev.detail.index)}"
						@queue-play-next="${(ev) => this.moveSongNext(ev.detail.index)}"
						@queue-remove="${(ev) => this.removeSongFromQueue(ev.detail.index)}"
						@queue-shuffle-upcoming="${this.shuffleUpcoming}"
						@open-album="${(ev) => location.hash = 'albums/' + this.queue[ev.detail.index].album._id}"
						@open-artist="${(ev) => location.hash = 'artists/' + this.queue[ev.detail.index].artist[0]._id}"
						@edit-song="${(ev) => this.editSongDialog.show(this.queue[ev.detail.index])}"
						@add-to-playlist="${(ev) => this.addToPlaylistDialog.show(ev.detail.list[ev.detail.index])}">
					</songz-side-panel>
				</app-drawer>
				<songz-main-view
					@play-song-now="${(ev) => this.replaceQueueWithSongs(ev.detail.list, ev.detail.index)}"
					@play-collection-now="${(ev) => this.replaceQueueWithSongs(ev.detail.list)}"
					@shuffle-collection-now="${(ev) => this.replaceQueueWithSongs(shuffle([...ev.detail.list]))}"
					@play-song-next="${(ev) => this.addSongsToQueue([ev.detail.list[ev.detail.index]], true)}"
					@play-collection-next="${(ev) => this.addSongsToQueue(ev.detail.list, true)}"
					@add-song-to-queue="${(ev) => this.addSongsToQueue([ev.detail.list[ev.detail.index]], false)}"
					@add-collection-to-queue="${(ev) => this.addSongsToQueue(ev.detail.list, false)}"
					@open-album="${(ev) => location.hash = 'albums/' + ev.detail.list[ev.detail.index].album._id}"
					@open-artist="${(ev) => location.hash = 'artists/' + ev.detail.list[ev.detail.index].artist[0]._id}"
					@open-queue="${() => this.sidePanel.parentElement.open()}"
					@edit-song="${(ev) => this.editSongDialog.show(ev.detail.list[ev.detail.index])}"
					@add-to-playlist="${(ev) => this.addToPlaylistDialog.show(ev.detail.list[ev.detail.index])}">
				</songz-main-view>
			</app-drawer-layout>
			<songz-player
				status="${this.playStatus}"
				currenttime="${this.currentTime}"
				duration="${this.duration}"
				.song="${this.queue[this.queuePosition]}"
				@previous="${this.prevSong}"
				@stepbackward="${this.stepBackward}"
				@playpause="${this.playPauseSong}"
				@stepforward="${this.stepForward}"
				@next="${this.nextSong}"
				@seek="${this.handleSeek}"
				@toggle-queue="${() => this.sidePanel.parentElement.toggle()}">
			</songz-player>
			<songz-edit-song-dialog
				@update-song="${this.handleMetadataUpdate}">
			</songz-edit-song-dialog>
			<songz-add-to-playlist-dialog></songz-add-to-playlist-dialog>
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
