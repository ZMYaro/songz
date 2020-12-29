'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	Album = require('../models/album.js'),
	Artist = require('../models/artist.js'),
	Genre = require('../models/genre.js'),
	Song = require('../models/song.js');

const router = express.Router();

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
		var songs = await Song.find({});
		res.json(songs);
	})
	.post(async function (req, res) {
		console.log('\nAdding new song:');
		console.dir(JSON.stringify(req.body));
		
		// Put all the text fields in the new song.
		var newSong = new Song({
			gDriveFLAC: req.body['gdrive-flac'],
			gDriveM4A: req.body['gdrive-m4a'],
			gDriveMP3: req.body['gdrive-mp3'],
			gDriveOGG: req.body['gdrive-ogg'],
			title: req.body['title'],
			trackNo: req.body['track-no']
		});
		
		var artistNames = req.body['artist'].split(';');
		for (let artistName of artistNames) {
			let artist = await Artist.findOrCreateOneByName(artistName);
			newSong.artist.push(artist._id);
		}
		
		
		await newSong.save();
		res.json(newSong);
	});

module.exports = router;
