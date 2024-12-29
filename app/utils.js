'use strict';

const GOOGLE_SCOPES = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/drive.readonly'
];

const SONG_AGGREGATE_POPULATE_STEPS = [
	{ $lookup: {
		from: 'albums',
		localField: 'album',
		foreignField: '_id',
		as: 'album'
	}},
	{ $lookup: {
		from: 'artists',
		localField: 'artist',
		foreignField: '_id',
		as: 'artist'
	}},
	{ $lookup: {
		from: 'artists',
		localField: 'composer',
		foreignField: '_id',
		as: 'composer'
	}},
	{ $lookup: {
		from: 'genres',
		localField: 'genre',
		foreignField: '_id',
		as: 'genre'
	}},
	{ $set: {
		album: { $arrayElemAt: ['$album', 0] },
		genre: { $arrayElemAt: ['$genre', 0] }
	}}
];

function handleError(res, message, code) {
	code = code ?? 500;
	console.error(`{ "status": ${code}, "message": "${message}" }`);
	res.status(code);
	res.json({ status: code, message: message });
}

/**
 * Convert a semicolon-separated list to an array, or return an empty array if invalid.
 * @param {String} input
 * @returns {Array<String>}
 */
function parseSemicolonSeparatedList(input) {
	// Remove whitespace from the ends and around each semicolon.
	return (input?.trim()?.split(/ *; */)) || [];
}

/**
 * Populate all the fields in a song query or document.
 * @param {Query|Document} song - The song query or document to populate
 * @returns {Promise} The result of tellitg Mongoose to populate the query, or document
 */
function populateSong(song) {
	var result = song.populate([
		{path: 'album', populate: {path: 'artist'}},
		'artist',
		'composer',
		'genre'
	]);
	if (result.exec) {
		// At time of writing, document.populate now returns a promise,
		// but query.populate still needs to be told to execute.
		result = result.exec();
	}
	return result;
}

/**
 * Process a duration value from the query, converting it to a positive number.
 * @param {String} inputDuration - The input value from the query
 * @returns {Number} - The duration, or undefined if the input was invalid
 */
function processDurationInput(inputDuration) {
	var duration = parseFloat(inputDuration);
	
	// If invalid, return undefined.
	if (!duration) { return undefined; }
	
	// Otherwise, ensure the duration is not negative.
	return Math.max(0, duration);
}

module.exports = {
	GOOGLE_SCOPES,
	SONG_AGGREGATE_POPULATE_STEPS,
	handleError,
	parseSemicolonSeparatedList,
	populateSong,
	processDurationInput
};
