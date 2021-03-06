'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@polymer/app-layout'; // Needed for <app-drawer> and <app-drawer-layout>.
import 'https://unpkg.com/@polymer/app-layout@3.1.0/app-layout.js?module';

import './songz-queue.js';
import './songz-player.js';
import './songz-song-list.js';
import {formatArtist, toGDriveURL} from '../scripts/utils.js';

export class SongZApp extends LitElement {
	
	activePlayer;
	inactivePlayer;
	
	static get properties() {
		return {
			status: { type: String, attribute: false },
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
	
	firstUpdated() {
		// Apply theming to old Polymer drawer.
		this.querySelector('app-drawer').shadowRoot.getElementById('contentContainer').style.backgroundColor = 'var(--mdc-theme-surface)';
		
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
			this.updatePositionState();
		});
		
		this.loadSongs();
	}

	async loadSongs() {
		let songsRes = await fetch('/api/songs');
		
		// For now, just put all the songs in the queue.
		this.queue = await songsRes.json();
		this.queue = this.queue.sort((a, b) => a.trackNo < b.trackNo ? -1 : 1);
	}

	loadSong(player, song) {
		player.innerHTML = '' +
			song.gDriveFLAC ? `<source src="${toGDriveURL(song.gDriveFLAC)}" type="audio/flac" />` : '' +
			song.gDriveM4A  ? `<source src="${toGDriveURL(song.gDriveM4A)}"  type="audio/x-m4a"  />` : '' +
			song.gDriveMP3  ? `<source src="${toGDriveURL(song.gDriveMP3)}"  type="audio/mp3"  />` : '' +
			song.gDriveOGG  ? `<source src="${toGDriveURL(song.gDriveOGG)}"  type="audio/ogg"  />` : '';
		player.load();
	}

	swapPlayers() {
		let temp = this.activePlayer;
		this.activePlayer = this.inactivePlayer;
		this.inactivePlayer = temp;
	}

	async playSong(i) {
		this.loadSong(this.activePlayer, this.queue[i]);
		if (i + 1 < this.queue.length) {
			this.loadSong(this.inactivePlayer, this.queue[i + 1]);
		}
		this.queuePosition = i;
		await this.resumeSong();
	}

	async playPauseSong() {
		if (this.status === 'paused') {
			this.resumeSong();
		} else {
			this.pauseSong();
		}
	}
	async resumeSong() {
		navigator.mediaSession.playbackState = 'none';
		this.status = 'buffering';
		this.duration = null;
		await this.activePlayer.play();
		navigator.mediaSession.playbackState = 'playing';
		this.currentTime = this.activePlayer.currentTime;
		this.duration = this.activePlayer.duration;
		this.updateMetadata();
		this.updatePositionState();
		this.status = 'playing';
	}
	async pauseSong() {
		await this.activePlayer.pause();
		navigator.mediaSession.playbackState = 'paused';
		this.status = 'paused';
	}
	async stopSong() {
		await this.activePlayer.pause();
		this.activePlayer.currentTime = 0;
		navigator.mediaSession.playbackState = 'paused';
		this.status = 'paused';
	}
	stepBackward() {
		this.activePlayer.currentTime -= 10;
		this.updatePositionState();
	}
	stepForward() {
		this.activePlayer.currentTime += 10;
		this.updatePositionState();
	}
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
	
	handleSeek(ev) {
		this.activePlayer.currentTime = ev.currentTarget.currentTime;
		this.updatePositionState();
	}
	
	handlePlayerTimeChange(ev) {
		this.currentTime = ev.currentTarget.currentTime;
		this.updatePositionState();
	}
	
	updateMetadata() {
		var song = this.queue[this.queuePosition];
		
		navigator.mediaSession.metadata = new MediaMetadata({
			title: song.title,
			artist: formatArtist(song, true),
			artwork: [{
				src: (song.gDriveArt ? toGDriveURL(song.gDriveArt) : '/images/unknown_album.svg') 
			}]
		});
	}
	
	updatePositionState() {
		if (!this.activePlayer.duration) {
			return;
		}
		navigator.mediaSession.setPositionState({
			duration: this.activePlayer.duration,
			playbackRate: this.activePlayer.playbackRate,
			position: this.activePlayer.currentTime
		});
	}
	
	render() {
		return html`
			<app-drawer-layout>
				<app-drawer slot="drawer" align="end" swipe-open>
					<h2>Queue</h2>
					<songz-queue
						.songs="${this.queue}"
						activeIndex="${this.queuePosition}"
						@queue-play-now="${(ev) => this.playSong(ev.detail)}">
					</songz-queue>
				</app-drawer>
				<main>
					<h1>It works?</h1>
					<songz-song-list .songs="${this.queue}"></songz-song-list>
				</main>
			</app-drawer-layout>
			<songz-player
				playing="${navigator.mediaSession.playbackState === 'playing'}"
				status="${this.status}"
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
	
	createRenderRoot() {
		// No shadow root.
		return this;
	}
}

window.customElements.define('songz-app', SongZApp);
