'use strict';

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
	return (input?.
		trim()?.
		split(';')?.
		map((elem) => elem.trim())) || [];
}

/**
 * Populate all the fields in a song query or document.
 * @param {Query|Document} song - The song query or document to populate
 * @returns {Query|Document} The populated query, or document ready to have execPopulate run on it
 */
function populateSong(song) {
	return song
		.populate({path: 'album', populate: {path: 'artist'}})
		.populate('artist')
		.populate('composer')
		.populate('genre');
}

module.exports = {
	handleError,
	parseSemicolonSeparatedList,
	populateSong
};
