'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Album = require('../models/album.js'),
	Artist = require('../models/artist.js'),
	Genre = require('../models/genre.js'),
	Playlist = require('../models/playlist.js'),
	PlaylistItem = require('../models/playlist_item.js'),
	Playthrough = require('../models/playthrough.js'),
	Song = require('../models/song.js'),
	{ handleError, populateSong } = require('../utils.js');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

router.all((req, res, next) => {
	res.set('Content-Type', 'application/json');
	next();
});

router.route('/songs')
	/**
	 * Get the list of all songs in the library or all that match the parameters exactly.
	 * [gdrive-flac] - The GDrive ID of the song's FLAC audio file
	 * [gdrive-m4a] - The GDrive ID of the song's M4A audio file
	 * [gdrive-mp3] - The GDrive ID of the song's MP3 audio file
	 * [gdrive-ogg] - The GDrive ID of the song's Ogg audio file
	 * [gdrive-art] - The GDrive ID of the song's album art file
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
	 */
	.get(async function (req, res) {
		var params = {};
		// Assume any param that was passed is intended to be included,
		// but trim or parse them to the correct formats before querying.
		if (req.query['gdrive-flac']) { params.gDriveFLAC = req.query['gdrive-flac'].trim(); }
		if (req.query['gdrive-m4a']) {  params.gDriveM4A = req.query['gdrive-m4a'].trim(); }
		if (req.query['gdrive-mp3']) {  params.gDriveMP3 = req.query['gdrive-mp3'].trim(); }
		if (req.query['gdrive-ogg']) {  params.gDriveOgg = req.query['gdrive-ogg'].trim(); }
		if (req.query['gdrive-art']) {  params.gDriveArt = req.query['gdrive-art'].trim(); }
		if (req.query['title']) {       params.title = req.query['title'].trim(); }
		if (req.query['duration']) {    params.duration = parseFloat(req.query['duration']); }
		if (req.query['track-no']) {    params.trackNo = Math.floor(parseInt(req.query['track-no'])); }
		if (req.query['disc-no']) {     params.discNo = Math.floor(parseInt(req.query['disc-no'])); }
		if (req.query['year']) {        params.year = Math.floor(parseInt(req.query['year'])); }
		
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
		
		var songs = await populateSong(Song.find(params).sort({ title: 'asc', artist: 'asc', album: 'asc' }));
		res.json(songs);
	})
	/**
	 * Add a new song to the library.
	 * [gdrive-flac] - The GDrive ID of the song's FLAC audio file
	 * [gdrive-m4a] - The GDrive ID of the song's M4A audio file
	 * [gdrive-mp3] - The GDrive ID of the song's MP3 audio file
	 * [gdrive-ogg] - The GDrive ID of the song's Ogg audio file
	 * [gdrive-art] - The GDrive ID of the song's album art file
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
	 */
	.post(async function (req, res) {
		console.log('\nAdding new song:');
		console.dir(JSON.stringify(req.body));
		
		var title = req.body['title']?.trim();
		if (!title) { return handleError(res, 'Missing title.', 422); }
		
		// Put all the text fields in the new song.
		var newSong = new Song({
			gDriveFLAC: req.body['gdrive-flac']?.trim(),
			gDriveM4A: req.body['gdrive-m4a']?.trim(),
			gDriveMP3: req.body['gdrive-mp3']?.trim(),
			gDriveOgg: req.body['gdrive-ogg']?.trim(),
			gDriveArt: req.body['gdrive-art']?.trim(),
			title: title,
			duration: parseFloat(req.body['duration']) || undefined,
			trackNo: Math.floor(parseInt(req.body['track-no'])),
			discNo: Math.floor(parseInt(req.body['disc-no'])),
			year: Math.floor(parseInt(req.body['year']))
		});
		
		if (req.body['artist']) {
			var artists = await Artist.findFromStrList(req.body['artist'], true);
			newSong.artist = artists.map((artist) => artist._id);
		}
		
		if (req.body['composer']) {
			var composers = await Artist.findFromStrList(req.body['composer'], true);
			newSong.composer = composers.map((composer) => composer._id);
		}
		
		var genreName = req.body['genre']?.trim();
		if (genreName) {
			let genre = await Genre.findOrCreateOne(genreName);
			newSong.genre = genre?._id;
		}
		
		var albumTitle = req.body['album-title']?.trim(),
			albumArtist = req.body['album-artist']?.trim();
		newSong.album = await Album.findOrCreateOne(albumTitle, albumArtist);
		
		await newSong.save();
		res.json(newSong);
	});

router.route('/albums')
	/** Get all albums. */
	.get(async function (req, res) {
		var albums = await Album.find({}).sort({ title: 'asc', artist: 'asc' });
		res.json(albums);
	});

router.route('/albums/:albumId')
	/** Get the album and its songs. */
	.get(async function (req, res) {
		var albumId = req.params.albumId;
		if (!mongoose.Types.ObjectId.isValid(albumId)) { return handleError(res, 'Album not found.', 404); }
		
		var album = await Album.findByIdWithSongs(albumId);
		if (!album) { return handleError(res, 'Album not found.', 404); }
		
		res.json(album);
	});

router.route('/artists')
	/** Get all artists. */
	.get(async function (req, res) {
		var artists = await Artist.find({}).sort({ name: 'asc' });
		res.json(artists);
	});

router.route('/artists/:artistId')
	/** Get the artist and all songs by or contributed to by xem. */
	.get(async function (req, res) {
		var artistId = req.params.artistId;
		if (!mongoose.Types.ObjectId.isValid(artistId)) { return handleError(res, 'Artist not found.', 404); }
		
		var artist = await Artist.findByIdWithSongs(artistId);
		if (!artist) { return handleError(res, 'Artist not found.', 404); }
		
		res.json(artist);
	});

router.route('/playlists')
	/** Get all playlists. */
	.get(async function (req, res) {
		var playlists = await Playlist.find({}).sort({ title: 'asc' });
		res.json(playlists);
	})
	/**
	 * Create a new playlist.
	 * title - The title of the playlist
	 * [description] - Description for the playlist
	 */
	.post(async function (req, res) {
		var title = req.body['title']?.trim(),
			description = req.body['description']?.trim();
		
		if (!title) { return handleError(res, 'Missing title.', 422); }
		
		var newPlaylist = new Playlist({
			title: title,
			description: description
		});
		await newPlaylist.save();
		res.json(newPlaylist);
	});

router.route('/playlists/:playlistId')
	/** Get a playlist's songs. */
	.get(async function (req, res) {
		var playlistId = req.params.playlistId;
		if (!mongoose.Types.ObjectId.isValid(playlistId)) { return handleError(res, 'Playlist not found.', 404); }
		
		var playlist = await Playlist.findByIdWithSongs(playlistId);
		if (!playlist) { return handleError(res, 'Playlist not found.', 404); }
		
		res.json(playlist);
	})
	/**
	 * Add a song to the playlist.
	 * song-id - The ID of the song to add
	 */
	.post(async function (req, res) {
		var playlistId = req.params.playlistId,
			songId = req.body['song-id'];
		
		if (!songId) { return handleError(res, 'Missing song ID.', 422); }
		if (!mongoose.Types.ObjectId.isValid(songId)) { return handleError(res, 'Song not found.', 404); }
		if (!mongoose.Types.ObjectId.isValid(playlistId)) { return handleError(res, 'Playlist not found.', 404); }
		
		var playlist = await Playlist.findById(playlistId).exec(),
			song = await Song.findById(songId).exec();
		
		if (!playlist) { return handleError(res, 'Playlist not found.', 404); }
		if (!song) { return handleError(res, 'Song not found.', 404); }
		
		var lastItem = await PlaylistItem.findOne({ playlist: playlist, nextItem: null }),
			newItem = new PlaylistItem({ playlist: playlist._id, song: song._id });
		
		if (lastItem) {
			lastItem.nextItem = newItem._id;
		} else {
			// If the playlist is empty, make this the first item.
			playlist.firstItem = newItem._id;
		}
		
		await Promise.all([
			(lastItem || playlist).save(),
			newItem.save()
		]);
		
		await populateSong(song).execPopulate();
		var returnableSong = song.toObject();
		returnableSong.itemId = newItem._id;
		res.json(returnableSong);
	})
	.patch(async function (req, res) {
		// TODO: Move song in playlist.
	})
	.delete(async function (req, res) {
		// TODO: Remove song from playlist.
	});

router.route('/playthroughs/:songId')
	/**
	 * Get the number of playthroughs for a song.
	 * [before] - The timestamp to get playthroughs before (defaults to infinity)
	 * [after] - The timestamp to get playthroughs after  (defaults to the epoch)
	 */
	.get(async function (req, res) {
		// TODO: Implement before and after.
		var params = {},
			songId = req.params.songId,
			beforeTimestamp = parseInt(req.query['before']),
			afterTimestamp = parseInt(req.query['after']);
		
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
		var playthroughs = await Playthrough.find(params);
		res.json(playthroughs);
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
