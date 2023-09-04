'use strict';

export const GPM_DIR_NAME = 'Google Play Music',
	TRACKS_DIR_NAME = 'Tracks',
	PLAYLISTS_DIR_NAME = 'Playlists',
	THUMBS_UP_PLAYLIST_NAME = 'Thumbs Up',
	PLAYLIST_METADATA_FILE_NAME = 'Metadata.csv',
	FILE_NAME_ILLEGAL_CHARS = /(&#39;|\\|\/|;|:|%|&|\*|\?|'|"|<|>|\|)+/g,
	FILE_NAME_MAX_LENGTH = 47,
	CSV_NAME_MAX_LENGTH = 50,
	TRACK_NO_PLACEHOLDER = '(###)',
	MAX_DUPLICATE_TITLES_TO_TRY = 20,
	MAX_TRACK_TO_TRY = 100,
	MAX_DISC_TO_TRY = 9;

/**
 * Print a new line to the output log.
 * @param {String} message - The message to print
 */
export function logMessage(message) {
	var messageParagraph = document.createElement('p');
	messageParagraph.innerHTML = message;
	log.insertAdjacentElement('beforeend', messageParagraph);
}
/**
 * Show a button for the user to click to continue
 * @returns {Promise} - Resolves when the button is selected
 */
export function showContinueButton() {
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
 * Show a progress bar.
 * @param {Number} max
 * @returns {HTMLProgressElement}
 */
export function showProgressBar(max) {
	var progressBar = document.createElement('progress');
	progressBar.value = 0;
	progressBar.max = max;
	log.insertAdjacentElement('beforeend', progressBar);
	return progressBar;
}

/**
 * Get the file name Google Takeout would have generated for the track's CSV.
 * @param {String} title - The title of the track, from its ID3 tag
 * @returns {String}
 */
export function getCSVNameFromTitle(title) {
	// Individual or consecutive series of illegal characters each get replaced withan underscore.
	var fileName = title.replace(FILE_NAME_ILLEGAL_CHARS, '_');
	
	if (fileName.length > CSV_NAME_MAX_LENGTH) {
		// If the title includes “feat. [artist]”, and is longer than 50
		// characters, that gets kept at the end minus the “feat” text.
		var featMatch = fileName.match(/feat(( |\.).+$)/);
		if (featMatch && featMatch[1]?.length < 16) {
			// IDK what the actual threshold is at which it does not do this,
			// so 16 is a random magic number that seems to work 🙃
			var startText = fileName.substring(0, (CSV_NAME_MAX_LENGTH - featMatch[1].length + 1));
			fileName = startText + featMatch[1];
			console.warn(`File name with feat. bit changed to ${fileName} with length ${fileName.length}...`);
		} else if (fileName.match(/.{50}\.\)/)) {
			// I am too tired to reverse engineer this case right now.
			fileName = fileName.substring(0, CSV_NAME_MAX_LENGTH) + ')';
		} else {
			// Any other name too long just gets truncated.
			fileName = fileName.substring(0, CSV_NAME_MAX_LENGTH);
		}
	}
	
	// For some reason, if the name ends with a period or a space, it gets replaced with an underscore.
	fileName = fileName.replace(/\.$/, '_').replace(/ $/, '_');
	
	// Whitespace at the front gets trimmed.
	fileName = fileName.trim();
	
	return fileName;
}

/**
 * A promisified wrapper for `Papa.parse`.
 * @param {File} file - The file to parse
 * @param {Object} config - The `Papa.parse` object, minus the `complete` and `error` parameters
 * @returns {Promise<Object>} - The `result` from `Papa.parse`'s `complete` callback
 */
export function parseCSV(file, config) {
	return new Promise(function (resolve, reject) {
		config = config || {};
		config.complete = function (results, file) {
			resolve(results);
		};
		config.error = function (error, file) {
			reject(error);
		};
		Papa.parse(file, config);
	});
}

/**
 * Convert HTML entities in a string to their respective characters.
 * @param {String} htmlText - The text containing HTML entities
 * @returns {String}
 */
export function removeHTMLEntities(htmlText) {
	var textArea = document.createElement('textarea');
	textArea.innerHTML = htmlText;
	return textArea.value;
}

/**
 * Check whether the title, album, and artist from a track's ID3 tags and CSV file match.
 * @param {Object} tags - The ID3 tags, from ID3JS
 * @param {Object} csvData - The CSV metadata, from Papa Parse
 * @returns {Boolean}
 */
export function checkID3CSVMatch(tags, csvData) {
	var csvPlainTitle = removeHTMLEntities(csvData.Title),
		csvPlainAlbum = removeHTMLEntities(csvData.Album),
		csvPlainArtist = removeHTMLEntities(csvData.Artist);
	
	// Compare with abstract equality because an empty value can be read as different falsey values.
	return (tags.title == csvPlainTitle &&
		(tags.album == csvPlainAlbum || (!tags.album && !csvData.Album)) &&
		(tags.artist == csvPlainArtist || (!tags.artist && !csvData.Artist)));
}

// EVERYTHING BELOW THIS POINT IS NO LONGER USED AND WILL PROBABLY GET DELETED.

/**
 * Get the file name Google Takeout might have generated for the track's MP3.
 * @param {Object} trackData - The data from the track's CSV without it)
 * @returns {String}
 */
export function getMP3NameFromData(trackData) {
	var fileName = `${trackData.Artist} - ${trackData.Album} - ${trackData.Title}`,
		fileNameNoTitle = `${trackData.Artist} - ${trackData.Album}`,
		fileNameWithTrackNo = `${trackData.Artist} - ${trackData.Album}${TRACK_NO_PLACEHOLDER}${trackData.Title}`;
	
	fileName = fileName.replace(FILE_NAME_ILLEGAL_CHARS, '_');
	fileNameNoTitle = fileNameNoTitle.replace(FILE_NAME_ILLEGAL_CHARS, '_');
	fileNameWithTrackNo = fileNameWithTrackNo.replace(FILE_NAME_ILLEGAL_CHARS, '_');
	
	if (fileName.length < FILE_NAME_MAX_LENGTH) {
		// If everything together is short enough, return it unmodified.
		return (fileName + '.mp3');
	}
	
	if (fileNameNoTitle.length >= (FILE_NAME_MAX_LENGTH - TRACK_NO_PLACEHOLDER.length)) {
		// If the file name cannot include the track title at all,
		// return it truncated, with the track number at the end.
		return (fileNameNoTitle.substring(0, FILE_NAME_MAX_LENGTH - TRACK_NO_PLACEHOLDER.length) +
			TRACK_NO_PLACEHOLDER +
			'.mp3');
	}
	
	// Else, return it truncated, with the track number before the title.
	return (fileNameWithTrackNo.substring(0, FILE_NAME_MAX_LENGTH) + '.mp3');
}

/**
 * Pad a number to 3 digits.
 * @param {Number} num - An integer 0 <= n <= 999
 * @returns {String}
 */
export function pad3Digits(num) {
	if (num < 10) {
		return ('00' + num);
	} else if (num < 100) {
		return ('0' + num);
	}
	return '' + num;
}
