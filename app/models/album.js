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
 @param {String} [artistNamesStr] - The exact name(s) of the artist(s), semicolon-separated
 * @returns {Promise<Album>}
 */
albumSchema.statics.findOrCreateOne = async function (title, artistNamesStr) {
	title = title?.trim();
	if (!title) { return; }
	var fields = {
		title: title
	};
	if (artistNamesStr) {
		var artists = await Artist.findFromStrList(artistNamesStr, true);
		fields.artist = artists.map((artist) => artist._id);
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
	
	album = await album.populate('artist').execPopulate();
	
	var songs = await populateSong(Song.find({ album: album }).sort({ discNo: 'asc', trackNo: 'asc' })),
		returnableAlbum = Object.assign({ songs: songs }, album.toObject());
	return returnableAlbum;
};

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
