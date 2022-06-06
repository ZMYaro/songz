'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Artist = require('../../models/artist.js'),
	{ handleError, populateSong } = require('../../utils.js');

const router = express.Router();

router.route('')
	/** Get all artists. */
	.get(async function (req, res) {
		var artists = await Artist.find({})
			.collation({ 'locale': 'en' })
			.sort({ name: 'asc' });
		res.json(artists);
	});

router.route('/:artistId')
	/** Get the artist and all songs by or contributed to by xem. */
	.get(async function (req, res) {
		var artistId = req.params.artistId;
		if (!mongoose.Types.ObjectId.isValid(artistId)) { return handleError(res, 'Artist not found.', 404); }
		
		var artist = await Artist.findByIdWithSongs(artistId);
		if (!artist) { return handleError(res, 'Artist not found.', 404); }
		
		res.json(artist);
	});

module.exports = router;
