'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	router = express.Router(),
	Song = require('../models/song.js');

function handleError(res, message, code) {
	console.error(message);
	res.status(code || 500);
	res.json({ error: message });
}

router.use(bodyParser.urlencoded({ extended: false }));

router.all((req, res, next) => {
	res.set('Content-Type', 'application/json');
	next();
});

router.route('/songs')
	.get(async function (req, res) {
		let songs = await Song.find({});
		res.json(songs);
	})
	.post(async function (req, res) {
		console.log('\nAdding new song:');
		console.dir(JSON.stringify(req.body));
		
		let newSong = new Song({
			gDriveFLAC: req.body['gdrive-flac'],
			gDriveM4A: req.body['gdrive-m4a'],
			gDriveMP3: req.body['gdrive-mp3'],
			gDriveOGG: req.body['gdrive-ogg'],
			title: req.body['title'],
			trackNo: req.body['track-no']
		});
		try {
			await newSong.save();
		} catch (err) {
			if (err) return handleError(res, err.message);
		}
		
		res.json(newSong);
	});

module.exports = router;
