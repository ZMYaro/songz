'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Artist = require('./artist'),
	Genre = require('./genre');

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
 * @returns {Album}
 */
albumSchema.statics.findOrCreateOne = async function (title, artistNames) {
	var fields = {
		title: title.trim()
	};
	for (let artistName of (artistNames || [])) {
		let artist = await Artist.findOrCreateOne(artistName);
		fields.artist = artist._id;
	}
	var album = await this.findOneAndUpdate(fields, fields, {
		new: true,
		upsert: true
	});
	return album;
};

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
