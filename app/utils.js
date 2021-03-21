'use strict';

function handleError(res, message, code) {
	code = code ?? 500;
	console.error(`Error ${code}: ${message}`);
	res.status(code);
	res.json({ status: code, error: message });
}

/**
 * Populate all the fields in a song query or document.
 * @param {Query|Document} song - The song query or document to populate
 * @returns {Query|Document} The populated query or document
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
	populateSong
};
