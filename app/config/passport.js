'use strict';

const passport = require('passport'),
	GoogleStrategy = require('passport-google-oauth20').Strategy,
	
	User = require('../models/user.js');

passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: '/auth/google/callback',
	proxy: true
}, async function (accessToken, refreshToken, profile, done) {
	let user = await User.findOne({ googleId: profile.id });
	await user.save();
	
	// Tell Passport done with DB.
	done(null, user);
}));
passport.serializeUser(function (user, done) {
	// Serialize the user's DB ID instead of xer Google ID.
	done(null, user.id);
});
passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

module.exports = { passport };
