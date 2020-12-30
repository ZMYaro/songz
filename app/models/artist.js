'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const artistSchema = new Schema({
	name: String
});

/**
 * Find an artist with the given name, or create it if it does not exist in the database.
 * @param {String} name - The exact name of the artist
 * @returns {Artist}
 */
artistSchema.statics.findOrCreateOne = async function (name) {
	name = name.trim();
	var artist = await this.findOneAndUpdate({name: name}, {name: name}, {
		new: true,
		upsert: true
	});
	return artist;
};

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
