'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Album = require('../../models/album.js'),
	Artist = require('../../models/artist.js'),
	Genre = require('../../models/genre.js'),
	Playthrough = require('../../models/playthrough.js'),
	Song = require('../../models/song.js'),
	{ handleError, populateSong, processDurationInput } = require('../../utils.js');

const router = express.Router();

router.route('')
	/**
	 * Get the list of all songs in the library or all that match the parameters exactly.
	 * [gdrive-flac] - The GDrive ID of the song's FLAC audio file
	 * [gdrive-m4a] - The GDrive ID of the song's M4A audio file
	 * [gdrive-mp3] - The GDrive ID of the song's MP3 audio file
	 * [gdrive-ogg] - The GDrive ID of the song's Ogg audio file
	 * [gdrive-art] - The GDrive ID of the song's album art file
	 * [gdrive-lrc] - The GDrive ID of the song's LRC lyric file
	 * [gdrive-md] - The GDrive ID of the song's markdown lyric file
	 * [title] - The song's title
	 * [duration] - The duration of the song, in milliseconds
	 * [track-no] - The track number of the song on its disc
	 * [disc-no] - The disc number of the song
	 * [year] - The year the song was released
	 * [genre] - The name of the song's genre
	 * [artist] - The name(s) of the song's artist(s), semicolon-separated
	 * [composer] - The name(s) of the song's composer(s), semicolon-separated
	 * [album-title] - The title of the album the song belongs to
	 * [album-artist] - The album artist of the album the song belongs to
	 * [rating] - The personal rating of the song, from −3 to +3
	 */
	.get(async function (req, res) {
		var params = {};
		// Assume any param that was passed is intended to be included,
		// but trim or parse them to the correct formats before querying.
		if (req.query['gdrive-flac']) { params.gDriveFLAC = req.query['gdrive-flac'].trim(); }
		if (req.query['gdrive-m4a'] ) { params.gDriveM4A = req.query['gdrive-m4a'].trim(); }
		if (req.query['gdrive-mp3'] ) { params.gDriveMP3 = req.query['gdrive-mp3'].trim(); }
		if (req.query['gdrive-ogg'] ) { params.gDriveOgg = req.query['gdrive-ogg'].trim(); }
		if (req.query['gdrive-art'] ) { params.gDriveArt = req.query['gdrive-art'].trim(); }
		if (req.query['gdrive-lrc'] ) { params.gDriveLRC = req.query['gdrive-lrc'].trim(); }
		if (req.query['gdrive-md']  ) { params.gDriveMD = req.query['gdrive-md'].trim(); }
		if (req.query['title']      ) { params.title = req.query['title'].trim(); }
		if (req.query['duration']   ) { params.duration = processDurationInput(req.query['duration']); }
		if (req.query['track-no']   ) { params.trackNo = Math.floor(parseInt(req.query['track-no'])); }
		if (req.query['disc-no']    ) { params.discNo = Math.floor(parseInt(req.query['disc-no'])); }
		if (req.query['year']       ) { params.year = Math.floor(parseInt(req.query['year'])); }
		if (req.query['rating']     ) { params.rating = parseInt(req.query['rating']); }
		if (req.query['genre']) {
			params.genre = await Genre.findOne({ name: req.query['genre'].trim() });
		}
		if (req.query['artist']) {
			params.artist = { $all: await Artist.findFromStrList(req.query['artist']) };
		}
		if (req.query['composer']) {
			params.composer = { $all: await Artist.findFromStrList(req.query['composer']) };
		}
		if (req.query['album-title']) {
			var albumParams = {
				title: req.query['album-title'].trim()
			};
			if (req.query['album-artist']) {
				albumParams.artist = { $all: await Artist.findFromStrList(req.query['album-artist']) };
			}
			params.album = await Album.findOne(albumParams);
		}
		
		var songs = await populateSong(Song.find(params)
			.collation({ 'locale': 'en' })
			.sort({ title: 'asc', artist: 'asc', album: 'asc' }));
		res.json(songs);
	})
	/**
	 * Add a new song to the library.
	 * [gdrive-flac] - The GDrive ID of the song's FLAC audio file
	 * [gdrive-m4a] - The GDrive ID of the song's M4A audio file
	 * [gdrive-mp3] - The GDrive ID of the song's MP3 audio file
	 * [gdrive-ogg] - The GDrive ID of the song's Ogg audio file
	 * [gdrive-art] - The GDrive ID of the song's album art file
	 * [gdrive-lrc] - The GDrive ID of the song's LRC lyric file
	 * [gdrive-md] - The GDrive ID of the song's markdown lyric file
	 * title - The song's title
	 * [duration] - The duration of the song, in milliseconds
	 * [track-no] - The track number of the song on its disc
	 * [disc-no] - The disc number of the song
	 * [year] - The year the song was released
	 * [genre] - The name of the song's genre
	 * [artist] - The name(s) of the song's artist(s), semicolon-separated
	 * [composer] - The name(s) of the song's composer(s), semicolon-separated
	 * [album-title] - The title of the album the song belongs to
	 * [album-artist] - The album artist of the album the song belongs to
	 * [playthroughs] - The number of past playthroughs
	 * [rating] - The personal rating of the song, from −3 to +3
	 */
	.post(async function (req, res) {
		console.log('\nAdding new song:');
		console.dir(JSON.stringify(req.body));
		
		var title = req.body['title']?.trim();
		if (!title) { return handleError(res, 'Missing title.', 422); }
		
		var rating = parseInt(req.body['rating']);
		rating = (!isNaN(rating) ? rating : undefined);
		
		// Put all the text fields in the new song.
		var newSong = new Song({
			gDriveFLAC: req.body['gdrive-flac']?.trim(),
			gDriveM4A: req.body['gdrive-m4a']?.trim(),
			gDriveMP3: req.body['gdrive-mp3']?.trim(),
			gDriveOgg: req.body['gdrive-ogg']?.trim(),
			gDriveArt: req.body['gdrive-art']?.trim(),
			gDriveLRC: req.body['gdrive-lrc']?.trim(),
			gDriveMD: req.body['gdrive-md']?.trim(),
			title: title,
			duration: processDurationInput(req.body['duration']),
			trackNo: Math.floor(parseInt(req.body['track-no'])) || undefined,
			discNo: Math.floor(parseInt(req.body['disc-no'])) || undefined,
			year: Math.floor(parseInt(req.body['year'])) || undefined,
			rating: rating
		});
		
		var genreName = req.body['genre']?.trim();
		if (genreName) {
			let genre = await Genre.findOrCreateOne(genreName);
			newSong.genre = genre?._id;
		}
		
		if (req.body['artist']) {
			let artists = await Artist.findFromStrList(req.body['artist'], true);
			newSong.artist = artists.map((artist) => artist._id);
		}
		
		if (req.body['composer']) {
			let composers = await Artist.findFromStrList(req.body['composer'], true);
			newSong.composer = composers.map((composer) => composer._id);
		}
		
		var albumTitle = req.body['album-title']?.trim(),
			albumArtist = req.body['album-artist']?.trim();
		newSong.album = await Album.findOrCreateOne(albumTitle, albumArtist);
		
		await newSong.save();
		
		if (req.body['playthroughs'] && !isNaN(parseInt(req.body['playthroughs']))) {
			let playthroughCount = parseInt(req.body['playthroughs']),
				playthroughObjects = [];
			for (let i = 0; i < playthroughCount; i++) {
				playthroughObjects.push({
					song: newSong._id,
					timestamp: new Date(0)
				});
			}
			await Playthrough.insertMany(playthroughObjects);
		}
		
		await populateSong(newSong).execPopulate();
		res.json(newSong);
	})
	.put(async function (req, res) {
		var song = await Song.findById(req.body.id);
		if (!song) { return handleError(res, 'Song not found.', 404); }
		var title = req.body['title']?.trim();
		if (!title) { return handleError(res, 'Missing title.', 422); }
		
		var rating = parseInt(req.body['rating']);
		rating = (!isNaN(rating) ? rating : undefined);
		
		song.gDriveFLAC = req.body['gdrive-flac']?.trim() || undefined;
		song.gDriveM4A = req.body['gdrive-m4a']?.trim() || undefined;
		song.gDriveMP3 = req.body['gdrive-mp3']?.trim() || undefined;
		song.gDriveOgg = req.body['gdrive-ogg']?.trim() || undefined;
		song.gDriveArt = req.body['gdrive-art']?.trim() || undefined;
		song.gDriveLRC = req.body['gdrive-lrc']?.trim() || undefined;
		song.gDriveMD = req.body['gdrive-md']?.trim() || undefined;
		song.title = title;
		song.duration = parseFloat(req.body['duration']) || undefined;
		song.trackNo = Math.floor(parseInt(req.body['track-no'])) || undefined;
		song.discNo = Math.floor(parseInt(req.body['disc-no'])) || undefined;
		song.year = Math.floor(parseInt(req.body['year'])) || undefined;
		song.rating = rating;
		
		var genre = await Genre.findOrCreateOne(req.body['genre']?.trim());
		song.genre = genre?._id;
		
		var artists = await Artist.findFromStrList(req.body['artist'], true);
		song.artist = artists?.map((artist) => artist._id);
		
		var composers = await Artist.findFromStrList(req.body['composer'], true);
		song.composer = composers?.map((composer) => composer._id);
		
		if (!req.body['album-title']) {
			song.album = undefined;
		} else {
			let albumTitle = req.body['album-title']?.trim(),
				albumArtist = req.body['album-artist']?.trim();
			song.album = await Album.findOrCreateOne(albumTitle, albumArtist);
		}
		
		await song.save();
		
		await populateSong(song).execPopulate();
		res.json(song);
	});

module.exports = router;
