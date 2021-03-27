'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const playthroughSchema = new Schema({
	song: {
		type: Schema.Types.ObjectId,
		ref: 'Song'
	},
	timestamp: Date
});

const Playthrough = mongoose.model('Playthrough', playthroughSchema);

module.exports = Playthrough;
