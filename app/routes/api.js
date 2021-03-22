'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Album = require('../models/album.js'),
	Artist = require('../models/artist.js'),
	Genre = require('../models/genre.js'),
	Playlist = require('../models/playlist.js'),
	PlaylistItem = require('../models/playlist_item.js'),
	Song = require('../models/song.js'),
	{ handleError, populateSong } = require('../utils.js');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

router.all((req, res, next) => {
	res.set('Content-Type', 'application/json');
	next();
});

router.route('/songs')
	/** Get the list of songs in the library. */
	.get(async function (req, res) {
		var songs = await populateSong(Song.find({}).sort({ title: 'asc', artist: 'asc', album: 'asc' }));
		res.json(songs);
	})
	/**
	 * Add a new song to the library.
	 * [gdrive-flac] - The GDrive ID of the song's FLAC audio file
	 * [gdrive-m4a] - The GDrive ID of the song's M4A audio file
	 * [gdrive-mp3] - The GDrive ID of the song's MP3 audio file
	 * [gdrive-ogg] - The GDrive ID of the song's OGG audio file
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
			gDriveOGG: req.body['gdrive-ogg']?.trim(),
			gDriveArt: req.body['gdrive-art']?.trim(),
			title: title,
			duration: Math.ceil(parseInt(req.body['duration'])),
			trackNo: Math.floor(parseInt(req.body['track-no'])),
			discNo: Math.floor(parseInt(req.body['disc-no'])),
			year: Math.floor(parseInt(req.body['year']))
		});
		
		var artistNames = req.body['artist']?.trim().split(';') || [];
		for (let artistName of artistNames) {
			let artist = await Artist.findOrCreateOne(artistName);
			if (!artist) { continue; }
			newSong.artist.push(artist._id);
		}
		
		var composerNames = req.body['composer']?.trim().split(';') || [];
		for (let composerName of composerNames) {
			let composer = await Artist.findOrCreateOne(composerName);
			if (!composer) { continue; }
			newSong.composer.push(composer._id);
		}
		
		var genreName = req.body['genre']?.trim();
		if (genreName) {
			let genre = await Genre.findOrCreateOne(genreName);
			newSong.genre = genre?._id;
		}
		
		var albumTitle = req.body['album-title']?.trim(),
			albumArtist = req.body['album-artist']?.trim().split(';') || [];
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

module.exports = router;
