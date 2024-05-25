'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	PlaylistItem = require('./playlist_item.js'),
	Song = require('./song.js'),
	{ SONG_AGGREGATE_POPULATE_STEPS, populateSong } = require('../utils.js');

const playlistSchema = new Schema({
	title: String,
	description: String,
	archived: Boolean,
	firstItem: {
		type: Schema.Types.ObjectId,
		ref: 'PlaylistItem'
	}
});

/**
 * Find a playlist by its ID and return it with its songs.
 * @param {String} id - The playlist's ID
 * @returns {Promise<Object>} Resolves with an object containing the playlist's document and a `songs` array of song documents
 */
playlistSchema.statics.findByIdWithSongs = async function (id) {
	var playlist = await this.findById(id);
	if (!playlist) { return; }
	
	// Get the items in the playlist.
	var playlistItems = await PlaylistItem.find({ playlist: playlist }),
		playlistItemsMap = {};
	playlistItems.forEach((playlistItem) => playlistItemsMap[playlistItem._id] = playlistItem);
	
	// Follow the linked list to build an ordered array of the playlist song IDs.
	var nextPlaylistItem = playlistItemsMap[playlist.firstItem],
		orderedSongIDs = [];
	while (nextPlaylistItem) {
		orderedSongIDs.push(nextPlaylistItem.song);
		nextPlaylistItem = playlistItemsMap[nextPlaylistItem.nextItem];
	}
	
	var songs = await Song.aggregate([
			{ $match: { _id: { $in: orderedSongIDs } } },
			{ $addFields: {
				listIndex: { $indexOfArray: [orderedSongIDs, '$_id'] }
			} },
			{ $sort: { listIndex: 1 } },
			...SONG_AGGREGATE_POPULATE_STEPS
		]),
		playlistWithSongs = Object.assign({ songs: songs }, playlist.toObject());
	return playlistWithSongs;
};

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
