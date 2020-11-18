'use strict';

// Using unpkg for now in place of transforming bare module specifiers.
//import '@polymer/app-layout'; // Needed for <app-drawer> and <app-drawer-layout>.
import 'https://unpkg.com/@polymer/app-layout@3.1.0/app-layout.js?module';


let activePlayer,
	inactivePlayer,
	queue = [],
	queuePosition = -1;

function toGDriveURL(gDriveId) {
	return `https://drive.google.com/uc?export=view&id=${gDriveId}`;
}

window.addEventListener('load', function () {
	activePlayer = document.getElementById('player1');
	inactivePlayer = document.getElementById('player2');
	
	document.getElementById('prev-btn').addEventListener('click', prevSong);
	document.getElementById('play-pause-btn').addEventListener('click', playPauseSong);
	document.getElementById('next-btn').addEventListener('click', nextSong);
	
	activePlayer.addEventListener('ended', nextSong);
	inactivePlayer.addEventListener('ended', nextSong);
	
	navigator.mediaSession.setActionHandler('play', resumeSong);
	navigator.mediaSession.setActionHandler('pause', pauseSong);
	navigator.mediaSession.setActionHandler('stop', stopSong);
	navigator.mediaSession.setActionHandler('previoustrack', prevSong);
	navigator.mediaSession.setActionHandler('nexttrack', nextSong);
	navigator.mediaSession.setActionHandler('seekto', function (details) {
		activePlayer.currentTime = details.seekTime;
	});
	
	loadSongs();
});

async function loadSongs() {
	let songsRes = await fetch('/api/songs'),
		songsTable = document.getElementById('song-list');
	
	queue = await songsRes.json();
	queue = queue.sort((a, b) => a.trackNo < b.trackNo ? -1 : 1);
	
	songsTable.innerHTML = '';
	queue.forEach((song, i) => {
		let songRow = document.createElement('tr'),
			playBtn = document.createElement('button');
		
		songRow.innerHTML = `
			<td>${song.trackNo}</td>
			<td>${song.title}</td>
			<td></td>`;
		playBtn.innerHTML = '▶️';
		playBtn.addEventListener('click', () => playSong(i));
		songRow.querySelector('td:last-of-type').appendChild(playBtn);
		songsTable.appendChild(songRow);
	});
}

function loadSong(player, song) {
	player.innerHTML = '' +
		song.gDriveFLAC ? `<source src="${toGDriveURL(song.gDriveFLAC)}" type="audio/flac" />` : '' +
		song.gDriveM4A  ? `<source src="${toGDriveURL(song.gDriveM4A)}"  type="audio/x-m4a"  />` : '' +
		song.gDriveMP3  ? `<source src="${toGDriveURL(song.gDriveMP3)}"  type="audio/mp3"  />` : '' +
		song.gDriveOGG  ? `<source src="${toGDriveURL(song.gDriveOGG)}"  type="audio/ogg"  />` : '';
	player.load();
}

function swapPlayers() {
	let temp = activePlayer;
	activePlayer = inactivePlayer;
	inactivePlayer = temp;
}

async function playSong(i) {
	loadSong(activePlayer, queue[i]);
	if (i < queue.length - 1) {
		loadSong(inactivePlayer, queue[i + 1]);
	}
	navigator.mediaSession.playbackState = 'playing';
	queuePosition = i;
	await activePlayer.play();
}

async function playPauseSong() {
	if (navigator.mediaSession.playbackState === 'playing') {
		pauseSong();
	} else {
		resumeSong();
	}
}
async function resumeSong() {
	navigator.mediaSession.playbackState = 'playing';
	await activePlayer.play();
}
async function pauseSong() {
	await activePlayer.pause();
	navigator.mediaSession.playbackState = 'paused';
}
async function stopSong() {
	await activePlayer.pause();
	navigator.mediaSession.playbackState = 'paused';
}
async function prevSong() {
	if (queuePosition - 1 < 0) {
		return;
	}
	swapPlayers();
	queuePosition--;
	loadSong(activePlayer, queue[queuePosition]);
	await inactivePlayer.pause();
	await resumeSong();
	inactivePlayer.currentTime = 0;
}
async function nextSong() {
	if (queuePosition + 1 >= queue.length) {
		return;
	}
	swapPlayers();
	await resumeSong();
	queuePosition++;
	loadSong(inactivePlayer, queue[queuePosition + 1]);
}