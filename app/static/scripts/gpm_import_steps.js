'use strict';

//import * as ID3 from 'id3js';
//import * as ID3 from 'https://unpkg.com/id3js@2.1.1/lib/id3.js';
import * as ID3 from './id3js/id3.js';

import * as Utils from '/scripts/gpm_import_utils.js';

/**
 * Fetch the track MP3s from the Tracks directory.
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<FileSystemFileHandle>>}
 */
export async function getTrackMP3s(tracksDir) {
	var trackMP3s = [];
	for await (let [name, handle] of tracksDir) {
		if (name.substr(-4) !== '.mp3') {
			continue;
		}
		trackMP3s.push(handle);
	}
	return trackMP3s;
}

/**
 * Fetch the track CSVs from the Tracks directory.
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<FileSystemFileHandle>>}
 */
export async function readTrackList(tracksDir) {
	var trackCSVs = [];
	for await (let [name, handle] of tracksDir) {
		if (name.substr(-4) !== '.csv') {
			continue;
		}
		trackCSVs.push(handle);
	}
	return trackCSVs;
}

/**
 * Parse each song's ID3 tags and CSV to JSON metadata.
 * @param {Array<FileSystemFileHandle>} trackMP3s
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<Object>>}
 */
export async function getAllTrackMetadata(trackMP3s, tracksDir) {
	var metadata = [],
		progressBar = Utils.showProgressBar(trackMP3s.length);
	
	for await (let trackMP3Handle of trackMP3s) {
		let trackData = await getTrackMetadata(trackMP3Handle, tracksDir);
		metadata.push(trackData);
		progressBar.value++;
	}
	
	return metadata;
}

/**
 * Get the metadata for a given track.
 * @param {FileSystemFileHandle} trackMP3Handle - The handle for the track's MP3
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Object>}
 */
async function getTrackMetadata(trackMP3Handle, tracksDir) {
	var mp3File = await trackMP3Handle.getFile();
	if (!mp3File) debugger;
	var tags = await ID3.fromFile(mp3File);
	if (!tags) debugger;
	var csvData = await getCSVData(tags, tracksDir);
	if (!csvData) debugger;
	
	return {
		title: tags.title,
		duration: csvData['Duration (ms)'],
		trackNo: parseInt(tags.track) ?? undefined,
		discNo: parseInt(tags['set-part']) ?? undefined,
		year: tags.year ?? undefined, // NOTE: Right now ID3.js appears to always return this as null ¯\_(ツ)_/¯
		artist: tags.artist ?? undefined,
		composer: tags.composer ?? undefined,
		albumTitle: tags.album ?? undefined,
		albumArtist: tags.band ?? undefined,
		genre: tags.genre ?? undefined,
		year: tags.year ?? undefined,
		playCount: csvData['Play Count']
	};
}


/**
 * Find the CSV file for the given song and return its data.
 * @param {Object} trackTags - The track's ID3 tags
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Object>}
 */
async function getCSVData(trackTags, tracksDir) {
	var csvFileName = Utils.getCSVNameFromTitle(trackTags.title);
	
	// If there were multiple tracks with the same title, find which numbered CSV matches the MP3.
	for (let i = -1; i < Utils.MAX_DUPLICATE_TITLES_TO_TRY; i++) {
		try {
			let attemptFileName = (i === -1) ? `${csvFileName}.csv` : `${csvFileName}(${i}).csv`,
				csvFileHandle = await tracksDir.getFileHandle(attemptFileName),
				csvFile = await csvFileHandle.getFile(),
				csvData = (await Utils.parseCSV(csvFile, { header: true })).data[0];
			
			if (Utils.checkID3CSVMatch(trackTags, csvData)) {
				return csvData;
			}
			
			if (i === Utils.MAX_DUPLICATE_TITLES_TO_TRY) {
				console.warn(`More than 10 tracks titled \u201c${trackTags.title}\u201d?`);
				debugger;
			}
		} catch (err) {}
	}
	
	throw new Error(`Unable to find a matching CSV for \u201c${trackTags.title}\u201d with file name \u201c${csvFileName}.csv\u201d.`);
}

/**
 * Parse each CSV to JSON metadata and upload it.
 * @param {Array<Object>} trackMetadataList
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<Response>>}
 */
export async function uploadTrackMetadata(trackMetadataList, tracksDir) {
	var uploadResponses = [],
		progressBar = Utils.showProgressBar(trackMetadataList.length);
	
	for await (let trackData of trackMetadataList) {
		let formData = new URLSearchParams();
		formData.append('title', trackData.title);
		if (trackData.duration   ) { formData.append('duration',     trackData.duration);    }
		if (trackData.trackNo    ) { formData.append('track-no',     trackData.trackNo);     }
		if (trackData.discNo     ) { formData.append('disc-no',      trackData.discNo);      }
		if (trackData.year       ) { formData.append('year',         trackData.year);        }
		if (trackData.genre      ) { formData.append('genre',        trackData.genre);       }
		if (trackData.artist     ) { formData.append('artist',       trackData.artist);      }
		if (trackData.composer   ) { formData.append('composer',     trackData.composer);    }
		if (trackData.albumTitle ) { formData.append('album-title',  trackData.albumTitle);  }
		if (trackData.albumArtist) { formData.append('album-artist', trackData.albumArtist); }
		if (trackData.playCount  ) { formData.append('playthroughs', trackData.playCount);   }
		
		let trackUpload = await fetch('/api/songs', {
			method: 'POST',
			body: formData
		});
		uploadResponses.push(trackUpload);
		progressBar.value++;
	}
	return uploadResponses;
}

/**
 * Fetch the playlist directories from the Playlists directory.
 * @param {FileSystemDirectoryHandle} playlistsDir
 * @returns {Promise<Array<FileSystemDirectoryHandle>>}
 */
export async function readPlaylistList(gpmDir) {
	try {
		var playlistsDir = await gpmDir.getDirectoryHandle(Utils.PLAYLISTS_DIR_NAME);
	} catch (err) {
		Utils.logMessage('No &ldquo;Playlists&rdquo; directory found.');
		throw err;
		return;
	}
	
	var playlistDirs = [];
	for await (let [name, handle] of playlistsDir) {
		if (handle.kind !== 'directory' || handle.name === Utils.THUMBS_UP_PLAYLIST_NAME) {
			continue;
		}
		playlistDirs.push(handle);
	}
	return playlistDirs;
}

/**
 * Parse each playlist's meta CSV to JSON metadata.
 * @param {Array<FileSystemDirectoryHandle>} playlistDirs
 * @returns {Promise<Array<Object>>}
 */
export async function getAllPlaylistMetadata(playlistDirs) {
	var playlists = [],
		progressBar = Utils.showProgressBar(playlistDirs.length);
	
	for (let playlistDir of playlistDirs) {
		let metadataCSVHandle = await playlistDir.getFileHandle(Utils.PLAYLIST_METADATA_FILE_NAME),
			metadataCSV = await metadataCSVHandle.getFile(),
			metadata = (await Utils.parseCSV(metadataCSV, { header: true })).data[0],
			tracksDirHandle = await playlistDir.getDirectoryHandle(Utils.TRACKS_DIR_NAME);
		playlists.push({
			title: Utils.removeHTMLEntities(metadata['Title']),
			description: Utils.removeHTMLEntities(metadata['Description']),
			tracksDir: tracksDirHandle
		});
		progressBar.value++;
	}
	return playlists;
}

/**
 * Parse each playlist's track CSVs.
 * @param {Array<Object>} playlists
 * @returns {Promise}
 */
export async function getAllPlaylistTracks(playlists) {
	var progressBar = Utils.showProgressBar(playlists.length);
	
	for (let playlist of playlists) {
		playlist.tracks = await getPlaylistTracks(playlist.tracksDir);
		progressBar.value++;
	}
}

/**
 * Parse the track CSVs for a playlist.
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<Object>>}
 */
async function getPlaylistTracks(tracksDir) {
	var tracks = [];
	
	for await (let [name, handle] of tracksDir) {
		let trackCSV = await handle.getFile(),
			csvData = (await Utils.parseCSV(trackCSV, { header: true })).data[0];
		tracks.push({
			title: Utils.removeHTMLEntities(csvData['Title']),
			artist: Utils.removeHTMLEntities(csvData['Artist']),
			albumTitle: Utils.removeHTMLEntities(csvData['Album']),
			index: csvData['Playlist Index']
		});
	}
	tracks = tracks.sort((a, b) => parseInt(a.index) < parseInt(b.index) ? -1 : 1);
	return tracks;
}

/**
 * Upload each playlist and its tracks.
 * @param {Array<Object>} playlists
 * @returns {Promise}
 */
export async function uploadPlaylists(playlists) {
	var progressBar = Utils.showProgressBar(playlists.length);
	
	for (let playlist of playlists) {
		// Upload the playlist's metadata.
		let playlistParams = new URLSearchParams();
		playlistParams.append('title', playlist.title);
		playlistParams.append('description', playlist.description);
		
		let playlistRes = await fetch('/api/playlists', {
			method: 'POST',
			body: playlistParams
		});
		
		let playlistData = await playlistRes.json();
		playlist.id = playlistData._id;
		
		// Now that the playlist exists, add the tracks.
		await uploadPlaylistTracks(playlist);
		
		progressBar.value++;
	}
}

/**
 * Upload each track from a playlist.
 * @param {Object} playlist
 * @returns {Promise}
 */
async function uploadPlaylistTracks(playlist) {
	for (let trackData of playlist.tracks) {
		// Get the ID the song has been assigned in the database.
		let songId = await getPlaylistSongId(trackData, playlist);
		if (!songId) {
			continue;
		}
		
		let trackParams = new URLSearchParams();
		trackParams.append('song-id', songId);
		
		let trackAddRes = await fetch(`/api/playlists/${playlist.id}`, {
			method: 'POST',
			body: trackParams
		});
		
		if (!trackAddRes.ok) {
			console.warn(`Error occurred while adding \u201c${trackData.title}\u201d for playlist \u201c${playlist.title}\u201d.`);
			debugger;
		}
	}
}

/**
 * Get the ID for a song from the database.
 * @param {Object} trackData
 * @param {Ojbect} playlist - Only for logging when something goes wrong
 * @returns {Promise<String>}
 */
async function getPlaylistSongId(trackData, playlist) {
	let songParams = new URLSearchParams();
	songParams.append('title', trackData.title);
	if (trackData.artist    ) { songParams.append('artist',      trackData.artist);     }
	if (trackData.albumTitle) { songParams.append('album-title', trackData.albumTitle); }
	
	let songRes = await fetch(`/api/songs?${songParams.toString()}`),
		songData = await songRes.json();
	
	if (!songData || songData.length === 0) {
		// If it was not found, try again without including the album title,
		// in case there are multiple albums with the same title and different artists.
		songParams.delete('album-title');
		songRes = await fetch(`/api/songs?${songParams.toString()}`);
		songData = await songRes.json();
	}
	if (!songData || songData.length === 0) {
		// If still not found, give up.
		console.warn(`Unable to find \u201c${trackData.title}\u201d for playlist \u201c${playlist.title}\u201d.`);
		debugger;
		return;
	}
	
	return songData[0]._id;
}
