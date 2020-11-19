'use strict';

//import {LitElement, html, css} from 'lit-element';
import {LitElement, html, css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';
//import '@polymer/app-layout'; // Needed for <app-drawer> and <app-drawer-layout>.
import 'https://unpkg.com/@polymer/app-layout@3.1.0/app-layout.js?module';

import {toGDriveURL} from '../scripts/utils.js';

export class SongZApp extends LitElement {
	
	activePlayer;
	inactivePlayer;
	queue = [];
	queuePosition = -1;
	
	firstUpdated() {
		this.activePlayer = this.querySelector('#player1');
		this.inactivePlayer = this.querySelector('#player2');
		
		//document.getElementById('prev-btn').addEventListener('click', prevSong);
		//document.getElementById('play-pause-btn').addEventListener('click', playPauseSong);
		//document.getElementById('next-btn').addEventListener('click', nextSong);
		
		//this.activePlayer.addEventListener('ended', nextSong);
		//this.inactivePlayer.addEventListener('ended', nextSong);
		
		navigator.mediaSession.setActionHandler('play', this.resumeSong.bind(this));
		navigator.mediaSession.setActionHandler('pause', this.pauseSong.bind(this));
		navigator.mediaSession.setActionHandler('stop', this.stopSong.bind(this));
		navigator.mediaSession.setActionHandler('previoustrack', this.prevSong.bind(this));
		navigator.mediaSession.setActionHandler('nexttrack', this.nextSong.bind(this));
		navigator.mediaSession.setActionHandler('seekto', (details) => {
			this.activePlayer.currentTime = details.seekTime;
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
		navigator.mediaSession.playbackState = 'playing';
		this.queuePosition = i;
		await this.activePlayer.play();
	}

	async playPauseSong() {
		if (navigator.mediaSession.playbackState === 'playing') {
			this.pauseSong();
		} else {
			this.resumeSong();
		}
	}
	async resumeSong() {
		navigator.mediaSession.playbackState = 'playing';
		await this.activePlayer.play();
	}
	async pauseSong() {
		await this.activePlayer.pause();
		navigator.mediaSession.playbackState = 'paused';
	}
	async stopSong() {
		await this.activePlayer.pause();
		this.activePlayer.currentTime = 0;
		navigator.mediaSession.playbackState = 'paused';
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
					<section>
						<button id="prev-btn" @click="${this.prevSong}">⏮</button>
						<button id="play-pause-btn" @click="${this.playPauseSong}">⏯</button>
						<button id="next-btn" @click="${this.nextSong}">⏭</button>
						<br />
						<audio id="player1" controls="controls" @ended="${this.nextSong}"></audio>
						<br />
						<audio id="player2" controls="controls" @ended="${this.nextSong}"></audio>
					</section>
				</main>
			</app-drawer-layout>
		`;
	}
	
	createRenderRoot() {
		// No shadow root.
		return this;
	}
}

window.customElements.define('songz-app', SongZApp);
