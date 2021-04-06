'use strict';

import {
	getTrackMP3s,
	getAllTrackMetadata,
	uploadTrackMetadata,
	readPlaylistList,
	getAllPlaylistMetadata,
	getAllPlaylistTracks
} from '/scripts/gpm_import_steps.js';
import * as Utils from '/scripts/gpm_import_utils.js';

var folderSelectButton,
	log;

window.addEventListener('load', function () {
	log = document.getElementById('log');
	folderSelectButton = document.getElementById('folder-select-button');
	folderSelectButton.disabled = false;
	folderSelectButton.addEventListener('click', selectGPMFolder);
});

/**
 * Prompt the user to select the Google Play Music Takeout directory
 * and parse its contents if selected.
 */
async function selectGPMFolder() {
	folderSelectButton.disabled = true;
	try {
		var gpmDir = await window.showDirectoryPicker();
	} catch (err) {
		// showDirectoryPicker throws if cancelled.
		Utils.logMessage('No directory selected.');
		folderSelectButton.disabled = false;
		throw err;
		return;
	}
	
	// Confirm the correct directory was selected.
	if (!gpmDir || !gpmDir.kind === 'directory' || !gpmDir.name === Utils.GPM_DIR_NAME) {
		Utils.logMessage('Please select your &ldquo;Google Play Music&rdquo; directory.');
		folderSelectButton.disabled = false;
		return;
	}
	
	// Get the directory with the tracks.
	try {
		var tracksDir = await gpmDir.getDirectoryHandle(Utils.TRACKS_DIR_NAME);
	} catch (err) {
		Utils.logMessage('No &ldquo;Tracks&rdquo; directory found.');
		throw err;
		return;
	}
	
	var trackMP3s = await getTrackMP3s(tracksDir);
	if (!trackMP3s) {
		Utils.logMessage('Failed to load tracks.  Aborting.');
		return;
	}
	
	Utils.logMessage(`Found ${trackMP3s.length} tracks.  This should match the number listed under Google Play Music on your <a href="https://myaccount.google.com/dashboard" target="_blank">Google Dashboard</a>.`);
	await Utils.showContinueButton();
	
	// Parse out song data.
	try {
		var trackMetadataList = await getAllTrackMetadata(trackMP3s, tracksDir);
	} catch (err) {
		Utils.logMessage('Failed to get track metadata.');
		throw err;
		return;
	}
	
	Utils.logMessage(`Consolidated metadata for ${trackMetadataList.length} tracks.  Beginning upload...`);
	
	try {
		await uploadTrackMetadata(trackMetadataList);
	} catch (err) {
		Utils.logMessage('Something went wrong during track metadata import.  Aborting.');
		throw err;
		return;
	}
	
	Utils.logMessage('Tracks uploaded.  Loading playlist directory...');
	
	var playlistDirs = await readPlaylistList(gpmDir);
	if (!playlistDirs) {
		return;
	}
	
	Utils.logMessage(`Found ${playlistDirs.length} playlists.  This should match the number listed under Google Play Music on your <a href="https://myaccount.google.com/dashboard" target="_blank">Google Dashboard</a>.`);
	await Utils.showContinueButton();
	
	try {
		var playlists = await getAllPlaylistMetadata(playlistDirs);
	} catch (err) {
		Utils.logMessage('Something went wrong during playlist metadata import.  Aborting.');
		throw err;
		return;
	}
	
	Utils.logMessage('Loaded playlists\' metadata.  Loading playlist tracks...');
	
	try {
		await getAllPlaylistTracks(playlists);
	} catch (err) {
		Utils.logMessage('Something went wrong during playlist track import.  Aborting.');
		throw err;
		return;
	}
	
	Utils.logMessage('Loaded playlist track metadata.  Beginning upload...');
	
	// TODO: Parse and upload playlist track data.
	Utils.logMessage('TODO: [see source code]');
	
	Utils.logMessage('Done!');
}
