'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const genreSchema = new Schema({
	name: String
});

const Genre = mongoose.model('Genre', genreSchema);

module.exports = Genre;
