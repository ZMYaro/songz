'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Playthrough = require('../../models/playthrough.js'),
	Song = require('../../models/song.js'),
	{ handleError, populateSong } = require('../../utils.js');

const router = express.Router();

router.route('/:songId')
	/**
	 * Get the number of playthroughs for a song.
	 * [before] - The timestamp to get playthroughs before (defaults to infinity)
	 * [after] - The timestamp to get playthroughs after  (defaults to the epoch)
	 * [count] - If included, return the number of playthroughs instead of the actual data
	 */
	.get(async function (req, res) {
		// TODO: Implement before and after.
		var params = {},
			songId = req.params.songId,
			beforeTimestamp = parseInt(req.query['before']),
			afterTimestamp = parseInt(req.query['after']),
			returnCount = (typeof req.query['count'] !== 'undefined');
		
		if (!mongoose.Types.ObjectId.isValid(songId)) { return handleError(res, 'Song not found.', 404); }
		
		var song = await Song.findById(songId).exec();
		
		if (!song) { return handleError(res, 'Song not found.', 404); }
		
		params.song = song;
		
		if (beforeTimestamp || afterTimestamp) {
			params.timestamp = {};
		}
		if (beforeTimestamp) {
			if (isNaN(beforeTimestamp)) { return handleError(res, 'Invalid before timestamp.', 422); }
			params.timestamp.$lt = new Date(beforeTimestamp);
		}
		if (afterTimestamp) {
			if (isNaN(afterTimestamp)) { return handleError(res, 'Invalid after timestamp.', 422); }
			params.timestamp.$gt = new Date(afterTimestamp);
		}
		
		if (returnCount) {
			var playthroughCount = await Playthrough.countDocuments(params);
			res.set('Content-Type', 'text/plain');
			res.send('' + playthroughCount);
		} else {
			var playthroughs = await Playthrough.find(params);
			res.json(playthroughs);
		}
	})
	/**
	 * Add a playthrough to a song.
	 * [timestamp] - The timestamp of the playthrough
	 */
	.post(async function (req, res) {
		var songId = req.params.songId,
			timestamp = parseInt(req.body['timestamp']);
		
		if (!mongoose.Types.ObjectId.isValid(songId)) { return handleError(res, 'Song not found.', 404); }
		if (isNaN(timestamp)) { return handleError(res, 'Invalid timestamp.', 422); }
		
		var song = await Song.findById(songId).exec();
		
		if (!song) { return handleError(res, 'Song not found.', 404); }
		
		var newPlaythrough = new Playthrough({
			song: song._id,
			timestamp: new Date(timestamp)
		});
		
		await newPlaythrough.save();
		res.json(newPlaythrough);
	});

module.exports = router;
