'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Song = require('./song.js'),
	{ parseSemicolonSeparatedList, populateSong } = require('../utils.js');

const artistSchema = new Schema({
	name: String
});

/**
 * Find an artist with the given name, or create it if it does not exist in the database.
 * @param {String} name - The exact name of the artist
 * @returns {Promise<Artist>}
 */
artistSchema.statics.findOrCreateOne = async function (name) {
	name = name?.trim();
	if (!name) { return; }
	var artist = await this.findOneAndUpdate({name: name}, {name: name}, {
		new: true,
		upsert: true
	});
	return artist;
};

/**
 * Find or optionally create artists requested in a semicolon-separated list.
 * @param {String} artistNamesStr - The name(s) of the artist(s), semicolon-separated
 * @param {Boolean} [createIfNotFound] - Whether to create new artists with names not found
 * @returns {Promise<Array<Artist>>} Resolves with the array of artists after all have been retrieved
 */
artistSchema.statics.findFromStrList = async function (artistNamesStr, createIfNotFound) {
	var artistNames = parseSemicolonSeparatedList(artistNamesStr),
		artists = [];
	for (let artistName of artistNames) {
		let artist = await (createIfNotFound ?
			this.findOrCreateOne(artistName.trim()) :
			this.findOne({ name: artistName.trim() }));
		if (!artist) { continue; }
		artists.push(artist);
	}
	return artists;
}

/**
 * Find an artist by xer ID and return xem with xer songs.
 * @param {String} id - The artist's ID
 * @returns {Promise<Object>} Resolves with an object containing the artist's document and a `songs` array of song documents
 */
artistSchema.statics.findByIdWithSongs = async function (id) {
	var artist = await this.findById(id);
	if (!artist) { return; }
	
	var artistSongsPromise = populateSong(Song.find({ artist: artist }).sort({ title: 'asc', album: 'asc' })),
		composerSongsPromise = populateSong(Song.find({ composer: artist }).sort({ title: 'asc', album: 'asc' }));
	
	await Promise.all([artistSongsPromise, composerSongsPromise]);
	
	var artistSongs = await artistSongsPromise,
		composerSongs = await composerSongsPromise,
		artistAndComposerWithSongs = Object.assign({ artistSongs: artistSongs, composerSongs, composerSongs }, artist.toObject());
	return artistAndComposerWithSongs;
};

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
