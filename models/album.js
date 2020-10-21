'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Artist = require('./artist'),
	Genre = require('./genre');

const albumSchema = new Schema({
	title: String,
	year: Number,
	artist: {
		type: Schema.Types.ObjectId,
		ref: Artist.modelName
	},
	genre: {
		type: Schema.Types.ObjectId,
		ref: Genre.modelName
	}
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
