'use strict';

import {GOOGLE_API_KEY} from '/api_key.js';

/**
 * Format a song's album as a links to that album.
 * @param {Song} song - A song object
 * @param {Boolean} returnPlainText - Whether to return plain text instead of a link
 * @returns {String} - The song's album as an HTML link
 */
export function formatAlbum(song, returnPlainText) {
	if (!song?.album) {
		return '';
	}
	if (returnPlainText) {
		return song.album.title;
	}
	return `<a href="#albums/${song.album._id}">${song.album.title}</a>`;
}

/**
 * Format a song's list of artist names as links to those artists.
 * @param {Song} song - A song object
 * @param {Boolean} returnPlainText - Whether to return plain text instead of links
 * @param {Boolean} returnComposers - Whether to return composers instead of artists
 * @returns {String} - The song's artists' names, as a semicolon-separated list
 */
export function formatArtist(song, returnPlainText, returnComposers) {
	if (!song?.artist || (returnComposers && !song?.composer)) {
		return '';
	}
	
	var returnProperty = (returnComposers ? 'composer' : 'artist');
	
	if (returnPlainText) {
		return song[returnProperty].map((artist) => artist.name).join('; ');
	}
	return song[returnProperty].map((artist) => `<a href="#artists/${artist._id}">${artist.name}</a>`).join('; ');
}

/**
 * Format a duration in M:SS or H:MM:SS format.
 * @param {Number} duration - The duration, in seconds
 * @returns {String} 
 */
export function formatDuration(duration) {
	if (isNaN(duration)) {
		return '\u2212\u2212:\u2212\u2212';
	}
	
	var hours = Math.floor(duration / 3600),
		minutes = Math.floor((duration - (hours * 3600)) / 60),
		seconds = Math.ceil(duration - (hours * 3600) - (minutes * 60));
	
	if (hours > 0 && minutes < 10) { minutes = '0' + minutes; }
	if (seconds < 10) { seconds = '0' + seconds; }
	
	return `${hours > 0 ? `${hours}:` : ``}${minutes}:${seconds}`;
}
/*	formatTime(time) {
		if (isNaN(time)) {
			return '\u2212\u2212:\u2212\u2212';
		}
		var minutes = Math.floor(time / 60),
			seconds = Math.floor(time - (minutes * 60));
		if (seconds < 10) {
			seconds = '0' + seconds;
		}
		return (minutes + ':' + seconds);
	}*/

/**
 * If a response had an HTTP error, turn it into a JavaScript error.
 * @param {Response} res
 * @returns {Promise} Resolves if no error, or rejects with the error code and message if there was an HTTP error
 */
export async function httpToJSError(res) {
	if (res.ok) {
		return;
	}
	
	var message = res.status;
	
	if (res.statusText) {
		message += ' - ' + res.statusText;
	} else {
		try {
			var resJSON = await res.json();
			if (resJSON.message || resJSON.error?.message) {
				message += ' - ' + (resJSON.message || resJSON.error?.message)
			}
		} catch (err) {}
	}
	
	throw new Error(message);
}

/**
 * Generate a link to retrieve the file at a Google Drive file ID.
 * @param {String} gDriveID - The ID of the Google Drive file
 * @param {Boolean} useAPI - Use the Google API URL instead of the CDN URL
 * @returns {String}
 */
export function toGDriveURL(gDriveID, useAPI) {
	if (useAPI) {
		return `https://www.googleapis.com/drive/v3/files/${gDriveID}?alt=media&key=${GOOGLE_API_KEY}`;
	} else {
		return `https://drive.google.com/uc?export=view&id=${gDriveID}`;
	}
}

/**
 * Open a menu when its menu button is clicked.
 * @param {MouseEvent} ev
 * @param {Menu} menu - The menu to be opened by the button
 * @param {Object} song - The selected song metadata
 * @param {Number} songIndex - The index of the song on the list
 */
export function showMenuForSong(ev, menu, song, songIndex) {
	ev.stopPropagation();
	
	// Open the menu from the button.
	menu.anchor = ev.currentTarget;
	menu.song = song;
	menu.songIndex = songIndex;
	menu.show();
}

/**
 * Send an event from the queue in response to a song menu item being clicked.
 * @param {CustomEvent} ev - The onselected event from the menu
 * @param {Array<Object>} songList - The list of songs from which the action was taken
 * @param {HTMLElement} component - The custom element to emit the event from
 */
export function handleMenuItemSelect(ev, songList, component) {
	// Get the action and song index recorded in data attributes.
	var action = ev.currentTarget.menu.selected?.value,
		index = parseInt(ev.currentTarget.songIndex);
	
	if (!action) {
		return;
	}
	
	// Send them to the app as an event from the component.
	component.dispatchEvent(new CustomEvent(action, {
		detail: {
			list: songList,
			index: index
		},
		bubbles: true,
		composed: true
	}));
}

/**
 * Set the page title suffixed with “- SongZ”.
 * @param {String} title
 */
export function setPageTitle(title) {
	document.title = (typeof title !== 'undefined') ? `${title} - SongZ` : 'SongZ';
}
