'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const genreSchema = new Schema({
	name: String
});

/**
 * Find a genre with the given name, or create it if it does not exist in the database.
 * @param {String} name - The exact name of the genre
 * @returns {Genre}
 */
genreSchema.statics.findOrCreateOne = async function (name) {
	name = name.trim();
	if (!name) { return; }
	var genre = await this.findOneAndUpdate({name: name}, {name: name}, {
		new: true,
		upsert: true
	});
	return genre;
};

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
