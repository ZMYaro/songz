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
		var songs = await Song.find({})
			.populate({path: 'album', populate: {path: 'artist'}})
			.populate('artist')
			.populate('composer')
			.populate('genre');
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
			gDriveArt: req.body['gdrive-art'],
			title: req.body['title'],
			trackNo: req.body['track-no'],
			discNo: req.body['disc-no']
		});
		
		var artistNames = req.body['artist']?.split(';') || [];
		for (let artistName of artistNames) {
			let artist = await Artist.findOrCreateOne(artistName);
			newSong.artist.push(artist._id);
		}
		
		var composerNames = req.body['composer']?.split(';') || [];
		for (let composerName of composerNames) {
			let composer = await Artist.findOrCreateOne(composerName);
			newSong.composer.push(composer._id);
		}
		
		var genreName = req.body['genre'];
		if (genreName) {
			let genre = await Genre.findOrCreateOne(genreName);
			newSong.genre = genre._id;
		}
		
		var albumTitle = req.body['album-title'],
			albumArtist = req.body['album-artist']?.split(';') || [];
		newSong.album = await Album.findOrCreateOne(albumTitle, albumArtist);
		
		await newSong.save();
		res.json(newSong);
	});

module.exports = router;
