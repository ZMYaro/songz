'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const artistSchema = new Schema({
	name: String
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
