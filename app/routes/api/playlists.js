'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	Playlist = require('../../models/playlist.js'),
	PlaylistItem = require('../../models/playlist_item.js'),
	Song = require('../../models/song.js'),
	{ handleError, populateSong } = require('../../utils.js');

const router = express.Router();

router.route('')
	/** Get all playlists. */
	.get(async function (req, res) {
		var playlists = await Playlist.find({})
			.collation({ 'locale': 'en' })
			.sort({ title: 'asc' });
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

router.route('/:playlistId')
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
		
		await populateSong(song);
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
