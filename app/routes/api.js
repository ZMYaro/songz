'use strict';

const bodyParser = require('body-parser'),
	express = require('express'),
	mongoose = require('mongoose'),
	songsRouter = require('./api/songs.js'),
	albumsRouter = require('./api/albums.js'),
	artistsRouter = require('./api/artists.js'),
	generateListRouter = require('./api/generate_list.js'),
	genresRouter = require('./api/genres.js'),
	playlistsRouter = require('./api/playlists.js'),
	playthroughsRouter = require('./api/playthroughs.js'),
	{ handleError, populateSong } = require('../utils.js');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use((req, res, next) => {
	res.set('Content-Type', 'application/json');
	// Ensure the user is authenticated, or fail the request.
	if (!req.user) {
		return handleError(res, 'Unauthorized.', 401);
	}
	next();
});

router.use('/songs', songsRouter);
router.use('/albums', albumsRouter);
router.use('/artists', artistsRouter);
router.use('/generatelist', generateListRouter);
router.use('/genres', genresRouter);
router.use('/playlists', playlistsRouter);
router.use('/playthroughs', playthroughsRouter);

module.exports = router;
