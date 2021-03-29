'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const songSchema = new Schema({
	gDriveFLAC: String,
	gDriveM4A: String,
	gDriveMP3: String,
	gDriveOgg: String,
	gDriveArt: String,
	title: String,
	duration: Number, // In milliseconds
	trackNo: Number,
	discNo: Number,
	year: Number,
	artist: [{
		type: Schema.Types.ObjectId,
		ref: 'Artist'
	}],
	composer: [{
		type: Schema.Types.ObjectId,
		ref: 'Artist'
	}],
	album: {
		type: Schema.Types.ObjectId,
		ref: 'Album'
	},
	genre: {
		type: Schema.Types.ObjectId,
		ref: 'Genre'
	}
});

const Song = mongoose.model('Song', songSchema);

module.exports = Song;
