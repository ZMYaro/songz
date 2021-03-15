'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	PlaylistItem = require('./playlist_item.js');

const playlistSchema = new Schema({
	title: String,
	description: String
});

/**
 * Find a playlist by its ID and return it with its songs.
 * @param {String} id - The playlist's ID
 * @returns {Object}
 */
playlistSchema.statics.findByIdWithSongs = async function (id) {
	// TODO
};

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
