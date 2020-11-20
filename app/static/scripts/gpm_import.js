'use strict';

const GPM_DIR_NAME = 'Google Play Music',
	TRACKS_DIR_NAME = 'Tracks',
	PLAYLISTS_DIR_NAME = 'Playlists';

var folderSelectButton,
	log;

window.addEventListener('load', function () {
	log = document.getElementById('log');
	folderSelectButton = document.getElementById('folder-select-button');
	folderSelectButton.addEventListener('click', selectGPMFolder);
});

/**
 * Print a new line to the output log.
 * @param {String} message - The message to print
 */
function logMessage(message) {
	var messageParagraph = document.createElement('p');
	messageParagraph.innerHTML = message;
	log.insertAdjacentElement('beforeend', messageParagraph);
}
/**
 * Show a button for the user to click to continue
 * @returns {Promise} - Resolves when the button is clicked
 */
function showContinueButton() {
	return new Promise (function (resolve, reject) {
		var button = document.createElement('button');
		button.innerText = 'Looks good';
		button.addEventListener('click', function () {
			this.disabled = true;
			resolve();
		});
		log.insertAdjacentElement('beforeend', button);
	});
}

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
		console.error(err);
		logMessage('No directory selected.');
		folderSelectButton.disabled = false;
		return;
	}
	
	// Confirm the correct directory was selected.
	if (!gpmDir || !gpmDir.kind === 'directory' || !gpmDir.name === GPM_DIR_NAME) {
		logMessage('Please select your &ldquo;Google Play Music&rdquo; directory.');
		folderSelectButton.disabled = false;
		return;
	}
		
	// Wait to parse and upload data.
	
	var trackCSVs = await readTrackList(gpmDir);
	if (!trackCSVs) {
		return;
	}
	
	logMessage(`Found ${trackCSVs.length} tracks.  This should match the number listed under Google Play Music on your <a href="https://myaccount.google.com/dashboard" target="_blank">Google Dashboard</a>.`);
	await showContinueButton();
	
	// TODO: Parse and upload song data.
	logMessage('TODO [see source code]');
	
	let playlistDirs = await readPlaylistList(gpmDir);
	if (!playlistDirs) {
		return;
	}
	
	logMessage(`Found ${playlistDirs.length} playlists.  This should be 1 more (because it includes the automatically generated &ldquo;Thumbs Up&rdquo; list) than the number listed under Google Play Music on your <a href="https://myaccount.google.com/dashboard" target="_blank">Google Dashboard</a>.`);
	await showContinueButton();
	
	// TODO: Parse playlist dir contents.
	// TODO: Parse and upload playlist track data.
	logMessage('TODO [see source code]');
	
	logMessage('Done!');
}

/**
 * Fetch the track CSVs from the Tracks directory.
 * @param {FileSystemDirectoryHandle} gpmDir
 */
async function readTrackList(gpmDir) {
	try {
		var tracksDir = await gpmDir.getDirectoryHandle(TRACKS_DIR_NAME);
	} catch (err) {
		console.error(err);
		logMessage('No &ldquo;Tracks&rdquo; directory found.');
		return;
	}
	
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
 * Fetch the playlist directories from the Playlists directory.
 * @param {FileSystemDirectoryHandle} playlistsDir
 */
async function readPlaylistList(gpmDir) {
	try {
		var playlistsDir = await gpmDir.getDirectoryHandle(PLAYLISTS_DIR_NAME);
	} catch (err) {
		console.error(err);
		logMessage('No &ldquo;Playlists&rdquo; directory found.');
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
