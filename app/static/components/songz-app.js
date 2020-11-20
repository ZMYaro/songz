'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@polymer/app-layout'; // Needed for <app-drawer> and <app-drawer-layout>.
import 'https://unpkg.com/@polymer/app-layout@3.1.0/app-layout.js?module';

import './songz-player.js';
import {toGDriveURL} from '../scripts/utils.js';

export class SongZApp extends LitElement {
	
	activePlayer;
	inactivePlayer;
	queue = [];
	queuePosition = -1;
	
	static get properties() {
		return {
			status: { type: String, attribute: false },
			currentTime: { type: Number, attribute: false },
			duration: { type: Number, attribute: false }
		};
	}
	
	firstUpdated() {
		this.activePlayer = new Audio();
		this.inactivePlayer = new Audio();
		this.activePlayer.addEventListener('timeupdate', this.handlePlayerTimeChange.bind(this));
		this.inactivePlayer.addEventListener('timeupdate', this.handlePlayerTimeChange.bind(this));
		this.activePlayer.addEventListener('ended', this.nextSong.bind(this));
		this.inactivePlayer.addEventListener('ended', this.nextSong.bind(this));
		
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
		let songsRes = await fetch('/api/songs'),
			songsTable = this.querySelector('#song-list');
		
		this.queue = await songsRes.json();
		this.queue = this.queue.sort((a, b) => a.trackNo < b.trackNo ? -1 : 1);
		
		songsTable.innerHTML = '';
		this.queue.forEach((song, i) => {
			let songRow = document.createElement('tr'),
				playBtn = document.createElement('button');
			
			songRow.innerHTML = `
				<td>${song.trackNo}</td>
				<td>${song.title}</td>
				<td></td>`;
			playBtn.innerHTML = '▶️';
			playBtn.addEventListener('click', () => this.playSong(i));
			songRow.querySelector('td:last-of-type').appendChild(playBtn);
			songsTable.appendChild(songRow);
		});
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
		if (i < this.queue.length - 1) {
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
			return;
		}
		this.swapPlayers();
		this.queuePosition--;
		this.loadSong(this.activePlayer, this.queue[this.queuePosition]);
		await this.inactivePlayer.pause();
		await this.resumeSong();
		this.inactivePlayer.currentTime = 0;
	}
	async nextSong() {
		if (this.queuePosition + 1 >= this.queue.length) {
			return;
		}
		this.swapPlayers();
		await this.resumeSong();
		this.queuePosition++;
		this.loadSong(this.inactivePlayer, this.queue[this.queuePosition + 1]);
	}
	
	handleSeek(ev) {
		this.activePlayer.currentTime = ev.currentTarget.currentTime;
		this.updatePositionState();
	}
	
	handlePlayerTimeChange(ev) {
		this.currentTime = ev.currentTarget.currentTime;
		this.updatePositionState();
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
					<table>
						<thead>
							<tr>
								<th>#</th>
								<th>Title</th>
								<th></th>
							</tr>
						</thead>
						<tbody id="song-list">
							<tr>
								<td colspan="3">Loading...</td>
							</tr>
						</tbody>
					</table>
				</app-drawer>
				<main>
					<h1>It works?</h1>
					<section>
						<h2>Add song</h2>
						<form method="POST" action="/api/songs">
							<label>
								GDrive FLAC:
								<input type="text" name="gdrive-flac" />
							</label>
							<label>
								GDrive M4A:
								<input type="text" name="gdrive-m4a" />
							</label>
							<label>
								GDrive MP3:
								<input type="text" name="gdrive-mp3" />
							</label>
							<label>
								GDrive OGG:
								<input type="text" name="gdrive-ogg" />
							</label>
							<label>
								Title:
								<input type="text" name="title" />
							</label>
							<label>
								Track #:
								<input type="number" name="track-no" />
							</label>
							<button type="submit">Submit</button>
						</form>
					</section>
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
