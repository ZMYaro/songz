'use strict';

const express = require('express'),
	passport = require('passport'),
	path = require('path');

const GOOGLE_SCOPES = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile'
];

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: GOOGLE_SCOPES }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth' }), (req, res) => {
	res.redirect('/');
});
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../views/sign_in.html'));
});

module.exports = router;
