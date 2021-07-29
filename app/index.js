'use strict';

const cookieSession = require('cookie-session'),
	express = require('express'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passport = require('passport'),
	GoogleStrategy = require('passport-google-oauth20').Strategy,
	User = require('./models/user.js'),
	apiRouter = require('./routes/api.js'),
	authRouter = require('./routes/auth.js'),
	guiRouter = require('./routes/gui.js');

const PORT = process.env.PORT || 8080,
	DB_NAME = 'songz',
	MONGODB_URI = process.env.MONGDB_URI || `mongodb://localhost:27017/${DB_NAME}`;

// Set up Express.
const app = express();
app.set('port', PORT);

// Set up Passport for auth.
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: '/auth/google/callback'
}, function (accessToken, refreshToken, profile, done) {
	User.findOne({ googleId: profile.id }).then(function (user) {
		// Tell Passport done with DB.
		done(null, user);
	});
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
app.use(cookieSession({
	name: 'session',
	keys: [process.env.SESSION_KEY],
	maxAge: 24 * 60 * 60 * 1000
}));
app.use(passport.initialize());
app.use(passport.session());

// Set up routes.
app.use(express.static('static'));
app.use('/node_modules', express.static('node_modules'));
app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/', guiRouter);

// Set up DB connection.
mongoose.connect(MONGODB_URI, {
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true
});
let db = mongoose.connection;
db.on('error', (err) => {
	console.error(err);
	process.exit(1);
})
db.once('open', function () {
	// Start server once DB ready.
	app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
});
