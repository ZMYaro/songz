'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Artist = require('../../models/artist.js'),
	Genre = require('../../models/genre.js'),
	Song = require('../../models/song.js'),
	{ SONG_AGGREGATE_POPULATE_STEPS, handleError, processDurationInput } = require('../../utils.js');

const router = express.Router();

router.route('')
	/**
	 * Generate a random list of tracks that meet the criteria
	 * [min-duration] - The minimum duration of a song, in milliseconds
	 * [max-duration] - The minimum duration of a song, in milliseconds
	 * [genre] - The name(s) of the genre(s) a song could be, semicolon-separated
	 * [artist] - The name(s) of the artist(s) a song could be from, semicolon-separated
	 * [composer] - The name(s) of the composer(s) a song could be from, semicolon-separated
	 * [min-year] - The earliest year a song could be released
	 * [max-year] - The latest year a song could be released
	 * [min-rating] - The minimum personal rating of the song, from −3 to +3
	 * count - The number of tracks to return, if possible
	 */
	.get(async function (req, res) {
		var count = Math.max(0, parseInt(req.query['count'])),
			params = {};
		
		if (isNaN(count)) { return handleError(res, 'Missing count.', 422); }
		
		if (req.query['min-duration'] || req.query['max-duration']) {
			params.duration = {
				$gte: processDurationInput(req.query['min-duration']) || 0,
				$lte: processDurationInput(req.query['max-duration']) || Number.MAX_SAFE_INTEGER
			};
		}
		if (req.query['genre']) {
			let genres = await Genre.findFromStrList(req.query['genre']),
				genreIds = genres.map((genre) => genre._id);
			params.genre = { $in: genreIds };
		}
		if (req.query['artist']) {
			let artists = await Artist.findFromStrList(req.query['artist']),
				artistIds = artists.map((artist) => artist._id);
			params.artist = { $in: artistIds };
		}
		if (req.query['composer']) {
			let composers = await Artist.findFromStrList(req.query['composer']),
				composerIds = composers.map((composer) => composer._id);
			params.composer = { $in: composerIds };
		}
		if (req.query['min-year'] || req.query['max-year']) {
			params.year = {
				$gte: parseInt(req.query['min-year']) || 0,
				$lte: parseInt(req.query['max-year']) || 9999
			};
		}
		if (req.query['min-rating']) {
			params.rating = {
				$gte: parseInt(req.query['min-rating'])
			};
		}
		
		var songs = await Song.aggregate([
				{ $match: params },
				{ $sample: {
					size: count
				}},
				...SONG_AGGREGATE_POPULATE_STEPS
			]);
		res.json(songs);
	});

module.exports = router;
