'use strict';

const express = require('express'),
	path = require('path'),
	Playthrough = require('../models/playthrough.js'),
	{ SONG_AGGREGATE_POPULATE_STEPS } = require('../utils.js');

const router = express.Router();

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/wrapped.html')));

router.get('/api/songs', async function (req, res) {
	const DEFAULT_YEAR = 2021,
		DEFAULT_START_DATE = `${DEFAULT_YEAR}-01-01`,
		DEFAULT_END_DATE = `${DEFAULT_YEAR}-12-31`,
		DEFAULT_COUNT = 100;
	
	var startDate = req.query['start']?.trim() || DEFAULT_START_DATE,
		endDate = req.query['end']?.trim() || DEFAULT_END_DATE,
		count = parseInt(req.query['count']) || DEFAULT_COUNT;
	
	var topSongs = await Playthrough.aggregate([
		{ $match: {
			'timestamp': {
				$gt: new Date(`${startDate}T00:00:00`),
				$lt: new Date(`${endDate}T23:59:59`)
			}
		}},
		{ $group: {
			_id: '$song',
			playthroughs: {
				$sum: 1
			}
		}},
		{ $sort: {
			playthroughs: -1
		}},
		{ $limit: count },
		{ $lookup: {
			from: 'songs',
			localField: '_id',
			foreignField: '_id',
			as: 'song',
			pipeline: SONG_AGGREGATE_POPULATE_STEPS
		}},
		{ $set: {
			playthroughs: { playthroughs: '$playthroughs' },
			song: { $arrayElemAt: ['$song', 0] }
		}},
		{ $replaceRoot: {
			newRoot: { $mergeObjects: ['$song', '$playthroughs'] }
		}}
	]);
	
	res.set('Access-Control-Allow-Origin', 'https://zmyaro.com');
	res.json(topSongs);
});

module.exports = router;
