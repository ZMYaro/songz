'use strict';

const cookieSession = require('cookie-session'),
	express = require('express'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passport = require('passport'),
	path = require('path'),
	GoogleStrategy = require('passport-google-oauth20').Strategy,
	bareModuleTransformMiddleware = require('express-transform-bare-module-specifiers').default,
	
	User = require('./models/user.js'),
	apiRouter = require('./routes/api.js'),
	authRouter = require('./routes/auth.js'),
	guiRouter = require('./routes/gui.js'),
	wrappedRouter = require('./routes/wrapped.js');

const PORT = process.env.PORT || 8080,
	DB_NAME = 'songz',
	MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

// Set up Express.
const app = express();
app.set('port', PORT);

app.use('*', bareModuleTransformMiddleware());

// Set up Passport for auth.
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: '/auth/google/callback',
	proxy: true
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
app.get('/manifest.webmanifest', (req, res) => res.sendFile(path.join(__dirname, 'manifest.webmanifest')));
app.get('/gapi.js', (req, res) => {
	res.set('Content-Type', 'text/javascript');
	res.send(`
		export const GOOGLE_API_KEY = '${process.env.GOOGLE_API_KEY}';
		export const GOOGLE_CLIENT_ID = '${process.env.GOOGLE_CLIENT_ID}';
	`);
});
app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/wrapped', wrappedRouter);
app.use('/', guiRouter);

// Fix Material web components leaving off file extensions.
app.get(/^\/node_modules\/@material\/.+\/(constants|foundation|rtl-(default|negative|reverse)-scroller|util)$/, (req, res) => {
	res.set('Content-Type', 'text/javascript');
	res.sendFile(path.join(__dirname, (req.path + '.js')));
	console.log('Fixed path to ' + path.join(__dirname, (req.path + '.js')));
});

// Set up DB connection.
mongoose.connect(MONGODB_URI);
let db = mongoose.connection;
db.on('error', (err) => {
	console.error(`Error connecting to database \u201c${MONGODB_URI}\u201d:`);
	console.error(err);
	process.exit(1);
})
db.once('open', function () {
	console.log(`Connected to database \u201c${MONGODB_URI}\u201d.`);
	// Start server once DB ready.
	app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
});
