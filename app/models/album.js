'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Artist = require('./artist.js'),
	Genre = require('./genre.js'),
	Song = require('./song.js'),
	populateSong = require('../utils.js').populateSong;

const albumSchema = new Schema({
	title: String,
	year: Number,
	artist: [{
		type: Schema.Types.ObjectId,
		ref: Artist.modelName
	}],
	genre: {
		type: Schema.Types.ObjectId,
		ref: Genre.modelName
	}
});

/**
 * Find an album with the given title and artist, or create it if it does not exist in the database.
 * @param {String} title - The exact title of the album
 * @param {Array<String>} [artistName] - The exact name of the album artist
 * @returns {Promise<Album>}
 */
albumSchema.statics.findOrCreateOne = async function (title, artistNames) {
	title = title.trim();
	if (!title) { return; }
	var fields = {
		title: title
	};
	for (let artistName of (artistNames || [])) {
		let artist = await Artist.findOrCreateOne(artistName);
		fields.artist = artist?._id;
	}
	var album = await this.findOneAndUpdate(fields, fields, {
		new: true,
		upsert: true
	});
	return album;
};

/**
 * Find a album by its ID and return it with its songs.
 * @param {String} id - The album's ID
 * @returns {Promise<Object>} Resolves with an object containing the album's document and a `songs` array of song documents
 */
albumSchema.statics.findByIdWithSongs = async function (id) {
	var album = await this.findById(id);
	if (!album) { return; }
	
	var songs = await populateSong(Song.find({ album: album })),
		returnableAlbum = Object.assign({ songs: songs }, album);
	return returnableAlbum;
};

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
