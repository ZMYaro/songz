'use strict';

import {GOOGLE_API_KEY, GOOGLE_CLIENT_ID} from '/gapi.js';
import * as ID3 from './id3js/id3.js';

const GOOGLE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

/**
 * Callback after the Google API script is loaded.
 */
window.handleGAPILoad = function () {
	gapi.load('client', initGAPIClient);
}

/**
 * Callback after the Google API client library is loaded.
 */
async function initGAPIClient() {
	await gapi.client.init({
		apiKey: GOOGLE_API_KEY,
		clientId: GOOGLE_CLIENT_ID,
		scope: GOOGLE_SCOPES,
		discoveryDocs: [GOOGLE_DISCOVERY_DOC]
	});
	if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
		gapi.auth2.getAuthInstance().isSignedIn.listen(handleAuth);
		gapi.auth2.getAuthInstance().signIn();
		return;
	}
	initForm();
}

/**
 * Callback after the user completes the Google auth flow, if necessary.
 * @param isSignedIn
 */
function handleAuth(isSignedIn) {
	if (!isSignedIn) {
		gapi.auth2.getAuthInstance().signIn();
		return;
	}
	initForm();
}

/**
 * Set up and enable the folder ID form.
 */
function initForm() {
	let folderIDForm = document.getElementById('folder-id-form');
	folderIDForm.addEventListener('submit', handleFolderIDSubmit);
	folderIDForm.querySelector('fieldset').disabled = false;
}

/**
 * Handle the folder ID form being submitted.
 * @param {SubmitEvent} ev
 */
async function handleFolderIDSubmit(ev) {
	ev.preventDefault();
	
	this.querySelector('fieldset').disabled = true;
	
	try {
		let folderID = this['folder-id'].value,
			filesData = await loadFilesMetadata(folderID),
			files = await loadFilesContents(filesData),
			songs = organizeSongObjects(files);
		showFolderTagEditor(songs);
	} catch (err) {
		alert(err.message);
	}
	
	this.querySelector('fieldset').disabled = false;
}

/**
 * Load the metadata of the files in the folder requested.
 * @param {String} folderID
 * @returns {Promise}
 */
async function loadFilesMetadata(folderID) {
	let folderRes;
	try {
		folderRes = await gapi.client.drive.files.list({
			pageSize: 1000,
			q: `'${folderID}' in parents and trashed=false`,
			fields: '*'
		});
	} catch (err) {
		console.error(err);
		throw new Error(`Failed to retrieve folder \u2013 ${err.message}`);
	}
	
	return folderRes.result.files;
}

/**
 * Load the contents of the files in the folder requested.
 * @param {Array<Object>} filesData
 * @returns {Promise}
 */
async function loadFilesContents(filesData) {
	let statusParagraph = document.createElement('p'),
		progressIndicator = document.createElement('progress'),
		progressSection = document.getElementById('progress-section');
	statusParagraph.textContent = `Loading ${filesData.length} files...`;
	progressIndicator.max = filesData.length;
	progressIndicator.value = 0;
	statusParagraph.appendChild(progressIndicator);
	progressSection.innerHTML = '';
	progressSection.appendChild(statusParagraph);
	
	let files = {},
		audioFileCount = 0;
	
	for (let fileData of filesData) {
		try {
			let fileRes = await gapi.client.drive.files.get({
					fileId: fileData.id,
					alt: 'media'
				}),
				dataArr = Uint8Array.from(fileRes.body.split('').map((chr) => chr.charCodeAt(0))),
				file = new File([dataArr], fileData.name, { type: fileData.mimeType });
			
			fileData.isAudio = !!fileData.mimeType.match('^audio\/');
			fileData.blobURL = URL.createObjectURL(file);
			if (fileData.isAudio) {
				let audio = new Audio();
				audio.src = fileData.blobURL;
				audio.type = fileData.mimeType;
				await audio.play();
				audio.pause();
				fileData.duration = Math.round(audio.duration * 1000);
				fileData.tags = await ID3.fromFile(file);
			}
			
			files[fileData.name] = fileData;
			progressIndicator.value++;
			if (fileData.isAudio) { audioFileCount++; }
		} catch (err) {
			console.error(err);
			throw new Error(`Failed to retrieve file \u201c${fileData.name}\u201d \u2013 ${err.message || err.result.error.message}`);
		}
	}
	
	statusParagraph.insertAdjacentText('beforeend', `Found ${audioFileCount} audio files.`);
	
	return files;
}

/**
 * Consolidate duplicate files into song objects that can be sent to the database.
 * @param {Object<String,Object>} files - Map of file names to objects with their GDrive metadata and ID3 tags
 * @returns {Array<Object<String,String|Number>>} - Array of song objects to be added to the form for user confirmation
 */
function organizeSongObjects(files) {
	let songsMap = {},
		art = [];
	
	for (let file of Object.values(files)) {
		if (!file.isAudio) {
			// Non-songs should be skipped over.  They are art, lyrics, or irrelevant.
			if (getFileType(file) === 'Art') {
				// If this is art, add it to the art array.
				art.push(file);
			}
			continue;
		}
		
		let fileType = getFileType(file),
			fileNameMinusExt = file.name.replace(/\..+$/, ''),
			gDriveIDKey = `gDrive${fileType}`;
		
		if (songsMap[fileNameMinusExt]) {
			// If this song was already found in another file format, just add this format to that object and move on.
			if (songsMap[fileNameMinusExt][gDriveIDKey]) {
				// If this song already exists in this format (M4A and MP4 versions), alert the user.
				alert(`Duplicate found for \u201c${file.name}\u201d!`);
				continue;
			}
			songsMap[fileNameMinusExt][gDriveIDKey] = file.id;
			continue;
		}
		
		// Assemble the new song object.
		songsMap[fileNameMinusExt] = {
			discNo: parseInt(file.tags['set-part']) ?? undefined,
			trackNo: parseInt(file.tags.track) ?? undefined,
			title: file.tags.title,
			duration: file.duration,
			genre: file.tags.genre ?? undefined,
			year: file.tags.year ?? undefined,
			artist: file.tags.artist ?? undefined,
			composer: file.tags.composer ?? undefined,
			albumTitle: file.tags.album ?? undefined,
			albumArtist: file.tags.band ?? undefined,
			year: file.tags.year ?? undefined,
			gDriveLRC: files[`${fileNameMinusExt}.lrc`]?.id ?? undefined,
			gDriveMD: files[`${fileNameMinusExt}.md`]?.id ?? undefined,
			[gDriveIDKey]: file.id,
			[`${gDriveIDKey}URL`]: file.blobURL
		};
	}
	
	for (let songName in songsMap) {
		songsMap[songName].gDriveArt = art[0]?.id;
	}
	
	let songsList = Object.values(songsMap);
	songsList.sort((a, b) => {
		if (a.discNo < b.discNo) {
			return -1;
		} else if (a.discNo > b.discNo) {
			return 1;
		} else if (a.trackNo < b.trackNo) {
			return -1;
		} else if (a.trackNo > b.trackNo) {
			return 1;
		}
		return 0;
	});
	
	return songsList;
}

/**
 * Identify the file type for the purposes of this submission
 * @param {Object} file - GDrive file object
 * @returns {String} - Specific type if it matters, 'Art' for any image, undefined if irrelevant
 */
function getFileType(file) {
	const extensionMap = {
		'\.flac$': 'FLAC',
		'\.m4a$': 'M4A',
		'\.mp3$': 'MP3',
		'\.mp4$': 'M4A',
		'\.ogg$': 'Ogg',
		'\.lrc': 'LRC',
		'\.md': 'MD',
		'\.gif': 'Art',
		'\.jpg': 'Art',
		'\.png': 'Art'
	};
	for (let ext in extensionMap) {
		if (file.name.match(ext)) {
			return extensionMap[ext];
		}
	}
}

/**
 * Add the songs to the folder view component.
 * @param {Array<Object<String,String|Number>>} songs
 */
function showFolderTagEditor(songs) {
	let elem = document.querySelector('songz-add-folder-view');
	elem.songs = songs;
}
