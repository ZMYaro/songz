'use strict';

const express = require('express'),
	path = require('path');

const router = express.Router();

router.use((req, res, next) => {
	// Ensure the user is authenticated, or redirect to the sign-in page.
	if (!req.user) {
		res.status(401);
		res.redirect('/auth');
		//res.sendFile(path.join(__dirname, '../views/sign_in.html'));
		return;
	}
	next();
});

router.get('/add', (req, res) => res.sendFile(path.join(__dirname, '../views/add_song.html')));
router.get('/addfolder', (req, res) => res.sendFile(path.join(__dirname, '../views/add_folder.html')));
router.get('/import', (req, res) => res.sendFile(path.join(__dirname, '../views/gpm_import.html')));
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/index.html')));

module.exports = router;
