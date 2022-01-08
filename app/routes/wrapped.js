'use strict';

const express = require('express'),
	path = require('path'),
	Playthrough = require('../models/playthrough.js');

const router = express.Router();

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/wrapped.html')));

router.get('/api/songs', async function (req, res) {
	const YEAR = 2021;
	var topSongs = await Playthrough.aggregate([
		{ $match: {
			'timestamp': {
				$gt: new Date(`${YEAR}-01-01`),
				$lt: new Date(`${YEAR}-12-31T23:59:59`)
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
		{ $limit: 100 },
		{ $lookup: {
			from: 'songs',
			localField: '_id',
			foreignField: '_id',
			as: 'song',
			pipeline: [
				{ $lookup: {
					from: 'artists',
					localField: 'artist',
					foreignField: '_id',
					as: 'artist'
				}},
				/*{ $lookup: {
					from: 'artists',
					localField: 'composer',
					foreignField: '_id',
					as: 'composer'
				}},*/
				{ $lookup: {
					from: 'albums',
					localField: 'album',
					foreignField: '_id',
					as: 'album'
				}},
				{ $set: {
					album: { $arrayElemAt: ['$album', 0] }
				}}
			]
		}},
		{ $set: {
			playthroughs: { playthroughs: '$playthroughs' },
			song: { $arrayElemAt: ['$song', 0] }
		}},
		{ $replaceRoot: {
			newRoot: { $mergeObjects: ['$song', '$playthroughs'] }
		}}
	]);
	
	res.json(topSongs);
});

module.exports = router;
