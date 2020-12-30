'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Album = require('./album'),
	Artist = require('./artist'),
	Genre = require('./genre');

const songSchema = new Schema({
	gDriveFLAC: String,
	gDriveM4A: String,
	gDriveMP3: String,
	gDriveOGG: String,
	gDriveArt: String,
	title: String,
	trackNo: Number,
	discNo: Number,
	artist: [{
		type: Schema.Types.ObjectId,
		ref: Artist.modelName
	}],
	composer: [{
		type: Schema.Types.ObjectId,
		ref: Artist.modelName
	}],
	album: {
		type: Schema.Types.ObjectId,
		ref: Album.modelName
	},
	genre: {
		type: Schema.Types.ObjectId,
		ref: Genre.modelName
	}
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
