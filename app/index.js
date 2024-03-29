'use strict';

const cookieSession = require('cookie-session'),
	express = require('express'),
	path = require('path'),
	bareModuleTransformMiddleware = require('express-transform-bare-module-specifiers').default,
	
	{ passport } = require('./config/passport.js'),
	{ db } = require('./config/mongoose.js'),
	apiRouter = require('./routes/api.js'),
	authRouter = require('./routes/auth.js'),
	guiRouter = require('./routes/gui.js'),
	wrappedRouter = require('./routes/wrapped.js'),
	{ GOOGLE_SCOPES } = require('./utils.js');

const PORT = process.env.PORT || 8080;

// Set up Express.
const app = express();
app.set('port', PORT);

app.use('*', bareModuleTransformMiddleware());

// Hook up Passport auth.
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
		export const GOOGLE_API_KEY = "${process.env.GOOGLE_API_KEY}";
		export const GOOGLE_CLIENT_ID = "${process.env.GOOGLE_CLIENT_ID}";
		export const GOOGLE_SCOPES = ${JSON.stringify(GOOGLE_SCOPES)};
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

db.on('error', () => process.exit(1));
// Start server once DB ready.
db.once('open', () => app.listen(PORT, () => console.log(`Listening on port ${PORT}...`)));
