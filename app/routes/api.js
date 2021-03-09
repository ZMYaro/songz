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

/**
 * Populate all the fields in a song query.
 * @param {Query} songs - The song query to populate
 * @returns {Query} The populated query
 */
function populateSongQuery(songs) {
	return songs
		.populate({path: 'album', populate: {path: 'artist'}})
		.populate('artist')
		.populate('composer')
		.populate('genre');
}

router.use(bodyParser.urlencoded({ extended: false }));

router.all((req, res, next) => {
	res.set('Content-Type', 'application/json');
	next();
});

router.route('/songs')
	.get(async function (req, res) {
		var songs = await populateSongQuery(Song.find({}));
		res.json(songs);
	})
	.post(async function (req, res) {
		console.log('\nAdding new song:');
		console.dir(JSON.stringify(req.body));
		
		// Put all the text fields in the new song.
		var newSong = new Song({
			gDriveFLAC: req.body['gdrive-flac']?.trim(),
			gDriveM4A: req.body['gdrive-m4a']?.trim(),
			gDriveMP3: req.body['gdrive-mp3']?.trim(),
			gDriveOGG: req.body['gdrive-ogg']?.trim(),
			gDriveArt: req.body['gdrive-art']?.trim(),
			title: req.body['title']?.trim(),
			duration: Math.ceil(parseInt(req.body['duration'])),
			trackNo: Math.floor(parseInt(req.body['track-no'])),
			discNo: Math.floor(parseInt(req.body['disc-no'])),
			year: Math.floor(parseInt(req.body['year']))
		});
		
		var artistNames = req.body['artist']?.trim().split(';') || [];
		for (let artistName of artistNames) {
			let artist = await Artist.findOrCreateOne(artistName);
			newSong.artist.push(artist._id);
		}
		
		var composerNames = req.body['composer']?.trim().split(';') || [];
		for (let composerName of composerNames) {
			let composer = await Artist.findOrCreateOne(composerName);
			newSong.composer.push(composer._id);
		}
		
		var genreName = req.body['genre']?.trim();
		if (genreName) {
			let genre = await Genre.findOrCreateOne(genreName);
			newSong.genre = genre._id;
		}
		
		var albumTitle = req.body['album-title']?.trim(),
			albumArtist = req.body['album-artist']?.trim().split(';') || [];
		newSong.album = await Album.findOrCreateOne(albumTitle, albumArtist);
		
		await newSong.save();
		res.json(newSong);
	});

router.route('/albums/:albumId')
	.get(async function (req, res) {
		var albumId = req.params.albumId,
			album = await Album.findById(albumId),
			songs = await populateSongQuery(Song.find({ album: album }));
		res.json(songs);
	});

router.route('/artists/:artistId')
	.get(async function (req, res) {
		var artistId = req.params.artistId,
			artist = await Artist.findById(artistId),
			songs = await populateSongQuery(Song.find({ artist: artist }));
		res.json(songs);
	});


module.exports = router;
