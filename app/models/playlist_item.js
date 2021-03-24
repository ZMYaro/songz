'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const playlistItemSchema = new Schema({
	playlist: {
		type: Schema.Types.ObjectId,
		ref: 'Playlist'
	},
	song: {
		type: Schema.Types.ObjectId,
		ref: 'Song'
	},
	nextItem: {
		type: Schema.Types.ObjectId,
		ref: 'PlaylistItem'
	}
});

const PlaylistItem = mongoose.model('PlaylistItem', playlistItemSchema);

module.exports = PlaylistItem;
