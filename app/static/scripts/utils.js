'use strict';

/**
 * Format a song's album as a links to that album.
 * @param {Song} song - A song object
 * @param {Boolean} returnPlainText - Whether to return plain text instead of a link
 * @returns {String} - The song's album as an HTML link
 */
export function formatAlbum(song, returnPlainText) {
	if (!song.album) {
		return '';
	}
	if (returnPlainText) {
		return song.album.title;
	}
	return `<a href="#/album/${song.album._id}">${song.album.title}</a>`;
}

/**
 * Format a song's list of artist names as links to those artists.
 * @param {Song} song - A song object
 * @param {Boolean} returnPlainText - Whether to return plain text instead of links
 * @returns {String} - The song's artists' names, as a semicolon-separated list
 */
export function formatArtist(song, returnPlainText) {
	if (!song.artist) {
		return '';
	}
	if (returnPlainText) {
		return song.artist.map((artist) => artist.name).join('; ');
	}
	return song.artist.map((artist) => `<a href="#/artist/${artist._id}">${artist.name}</a>`).join('; ');
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

export function toGDriveURL(gDriveId) {
	return `https://drive.google.com/uc?export=view&id=${gDriveId}`;
}
