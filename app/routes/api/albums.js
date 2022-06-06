'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Album = require('../../models/album.js'),
	{ handleError, populateSong } = require('../../utils.js');

const router = express.Router();

router.route('')
	/** Get all albums. */
	.get(async function (req, res) {
		var albums = await Album.find({})
			.collation({ 'locale': 'en' })
			.sort({ title: 'asc', artist: 'asc' })
			.populate('artist');
		res.json(albums);
	});

router.route('/:albumId')
	/** Get the album and its songs. */
	.get(async function (req, res) {
		var albumId = req.params.albumId;
		if (!mongoose.Types.ObjectId.isValid(albumId)) { return handleError(res, 'Album not found.', 404); }
		
		var album = await Album.findByIdWithSongs(albumId);
		if (!album) { return handleError(res, 'Album not found.', 404); }
		
		res.json(album);
	});

module.exports = router;
