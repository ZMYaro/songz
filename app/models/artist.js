'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Song = require('./song.js'),
	populateSong = require('../utils.js').populateSong;

const artistSchema = new Schema({
	name: String
});

/**
 * Find an artist with the given name, or create it if it does not exist in the database.
 * @param {String} name - The exact name of the artist
 * @returns {Promise<Artist>}
 */
artistSchema.statics.findOrCreateOne = async function (name) {
	name = name.trim();
	if (!name) { return; }
	var artist = await this.findOneAndUpdate({name: name}, {name: name}, {
		new: true,
		upsert: true
	});
	return artist;
};

/**
 * Find an artist by xer ID and return xem with xer songs.
 * @param {String} id - The artist's ID
 * @returns {Promise<Object>} Resolves with an object containing the artist's document and a `songs` array of song documents
 */
artistSchema.statics.findByIdWithSongs = async function (id) {
	var artist = await this.findById(id);
	if (!artist) { return; }
	
	var songs = await populateSong(Song.find({ artist: artist })),
		returnableArtist = Object.assign({ songs: songs }, artist);
	return returnableArtist;
};

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
