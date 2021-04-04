'use strict';

//import * as ID3 from 'id3js';
import * as ID3 from 'https://unpkg.com/id3js@2.1.1/lib/id3.js';

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
 * Parse each CSV to JSON metadata and upload it.
 * @param {Array<FileSystemFileHandle>} trackMP3s
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<Object>>}
 */
export async function getAllTrackMetadata(trackMP3s, tracksDir) {
	var metadata = [],
		progressBar = document.createElement('progress');
	
	progressBar.max = trackMP3s.length;
	log.insertAdjacentElement('beforeend', progressBar);
	
	for await (let trackMP3Handle of trackMP3s) {
		let trackData = await getTrackMetadata(trackMP3Handle, tracksDir);
		metadata.push(trackData);
		progressBar.value++;
	}
	
	return metadata;
}

/**
 * Get all the metadata for a given track.
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
		artist: tags.artist ?? undefined,
		composer: tags.composer ?? undefined,
		album: tags.album ?? undefined,
		genre: tags.genre ?? undefined
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
	debugger;
}

/**
 * Parse each CSV to JSON metadata and upload it.
 * @param {Array<FileSystemFileHandle>} trackCSVs
 * @param {FileSystemDirectoryHandle} tracksDir
 * @returns {Promise<Array<Promise<Response>>>}
 */
export async function uploadTrackMetadata(trackCSVs, tracksDir) {
	var requestPromises = [];
	
	for await (let trackCSVHandle of trackCSVs) {
		//let trackCSVFile = await trackCSVHandle.getFile(),
		//	trackData = (await Utils.parseCSV(trackCSVFile, { header: true })).data[0],
		//	trackMP3Name = getMP3NameFromData(trackData),
		//	trackTags = 
		let trackData = await getTrackMetadata(trackCSVHandle, tracksDir),
			formData = new FormData();
		
		//formData.append('album-title', trackData['Album']?.trim());
		//formData.append('artist', trackData['Artist']?.trim());
		//formData.append('duration', trackData['Duration (ms)']);
		// TODO: Include rating
		//formData.append('rating', trackData['Rating']);
		//formData.append('title', trackData['Title']?.trim());
		//formData.append('', trackData['']);
		//console.log(trackData.Title, Object.keys(trackData));
		//if (Object.keys(trackData).length > 7 || trackData.Removed)
		//	console.log(trackData);
		//debugger;
		//let trackUpload = fetch('/api/songs', {
		//	method: 'POST',
		//	body: formData
		//});
		//requestPromises.push(trackUpload);
	}
	console.warn('TODO: Play counts not included in upload yet!!!');
	return requestPromises;
}

/**
 * Fetch the playlist directories from the Playlists directory.
 * @param {FileSystemDirectoryHandle} playlistsDir
 */
export async function readPlaylistList(gpmDir) {
	try {
		var playlistsDir = await gpmDir.getDirectoryHandle(Utils.PLAYLISTS_DIR_NAME);
	} catch (err) {
		console.error(err);
		Utils.logMessage('No &ldquo;Playlists&rdquo; directory found.');
		return;
	}
	
	var playlistDirs = [];
	for await (let [name, handle] of playlistsDir) {
		if (handle.kind !== 'directory') {
			continue;
		}
		playlistDirs.push(handle);
	}
	return playlistDirs;
}
