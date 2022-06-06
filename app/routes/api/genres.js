'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Genre = require('../../models/genre.js'),
	{ handleError, populateSong } = require('../../utils.js');

const router = express.Router();

router.route('')
	/** Get all genres. */
	.get(async function (req, res) {
		var genres = await Genre.find({})
			.collation({ 'locale': 'en' })
			.sort({ name: 'asc' });
		res.json(genres);
	});

router.route('/:genreId')
	/** Get the genre and all songs in it. */
	.get(async function (req, res) {
		var genreId = req.params.genreId;
		if (!mongoose.Types.ObjectId.isValid(genreId)) { return handleError(res, 'Genre not found.', 404); }
		
		var genre = await Genre.findByIdWithSongs(genreId);
		if (!genre) { return handleError(res, 'Genre not found.', 404); }
		
		res.json(genre);
	});

module.exports = router;
