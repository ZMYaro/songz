'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Album = require('./album'),
	Artist = require('./artist'),
	Genre = require('./genre');

const songSchema = new Schema({
	gDriveId: String,
	title: String,
	trackNo: Number,
	discNo: Number,
	album: {
		type: Schema.Types.ObjectId,
		ref: Album.modelName
	},
	artist: {
		type: Schema.Types.ObjectId,
		ref: Artist.modelName
	},
	composer: {
		type: Schema.Types.ObjectId,
		ref: Artist.modelName
	},
	genre: {
		type: Schema.Types.ObjectId,
		ref: Genre.modelName
	}
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
