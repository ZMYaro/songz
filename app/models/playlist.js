'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	PlaylistItem = require('./playlist_item.js'),
	populateSong = require('../utils.js').populateSong;

const playlistSchema = new Schema({
	title: String,
	description: String,
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
	const MAX_DEPTH = 1024; // TODO: Lower this when things start getting loaded in chunks.
	
	async function addItemToSongsArray(item, songsArr, depth) {
		// Stop if the maximum playlist length has been exceeded.
		if (depth >= MAX_DEPTH) {
			return;
		}
		
		// Add the item to the playlist.
		await item.populate('song').execPopulate();
		await populateSong(item.song).execPopulate();
		var song = item.song.toObject();
		song.itemId = item._id;
		songsArr.push(song);
		
		// Get the next item and recurse if there is one.
		await item.populate('nextItem').execPopulate();
		if (!item.$isEmpty('nextItem')) {
			await addItemToSongsArray(item.nextItem, songsArr, depth + 1);
		}
	}
	
	// Get the playlist and make a basic object version to add the items to and return.
	var playlist = await this.findById(id);
	if (!playlist) { return; }
	
	var returnablePlaylist = Object.assign({ songs: [] }, playlist);
	
	// Load the first item and then start recursively loading the rest of the list.
	await playlist.populate('firstItem').execPopulate();
	if (!playlist.$isEmpty('firstItem')) {
		await addItemToSongsArray(playlist.firstItem, returnablePlaylist.songs, 0);
	}
	
	return returnablePlaylist;
};

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
