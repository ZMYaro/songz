'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Song = require('./song.js'),
	{ parseSemicolonSeparatedList, populateSong } = require('../utils.js');

const genreSchema = new Schema({
	name: String
});

/**
 * Find a genre with the given name, or create it if it does not exist in the database.
 * @param {String} name - The exact name of the genre
 * @returns {Genre}
 */
genreSchema.statics.findOrCreateOne = async function (name) {
	name = name?.trim();
	if (!name) { return; }
	var genre = await this.findOneAndUpdate({name: name}, {name: name}, {
		new: true,
		upsert: true
	});
	return genre;
};

/**
 * Find or optionally create genres requested in a semicolon-separated list.
 * @param {String} genreNamesStr - The name(s) of the genre(s), semicolon-separated
 * @param {Boolean} [createIfNotFound] - Whether to create new genres with names not found
 * @returns {Promise<Array<Genre>>} Resolves with the array of genres after all have been retrieved
 */
genreSchema.statics.findFromStrList = async function (genreNamesStr, createIfNotFound) {
	var genreNames = parseSemicolonSeparatedList(genreNamesStr),
		genres = [];
	for (let genreName of genreNames) {
		let genre = await (createIfNotFound ?
			this.findOrCreateOne(genreName.trim()) :
			this.findOne({ name: genreName.trim() }));
		if (!genre) { continue; }
		genres.push(genre);
	}
	return genres;
}

/**
 * Find a genre by its ID and return it with all songs in it.
 * @param {String} id - The genre's ID
 * @returns {Promise<Object>} Resolves with an object containing the genre's document and a `songs` array of song documents
 */
genreSchema.statics.findByIdWithSongs = async function (id) {
	var genre = await this.findById(id);
	if (!genre) { return; }
	
	var songs = await populateSong(Song.find({ genre: genre }).sort({ discNo: 'asc', trackNo: 'asc' })),
		genreWithSongs = Object.assign({ songs: songs }, genre.toObject());
	return genreWithSongs;
};

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
