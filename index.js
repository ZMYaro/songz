'use strict';

const express = require('express'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	path = require('path'),
	apiRouter = require('./routes/api');

const PORT = process.env.PORT || 8080,
	DB_NAME = 'songz',
	MONGODB_URI = process.env.MONGDB_URI || `mongodb://localhost:27017/${DB_NAME}`;

// Set up Express.
let app = express();
app.set('port', PORT);

// Set up DB connection.
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', (err) => {
	console.error(err);
	process.exit(1);
})
db.once('open', function () {
	// Start server once DB ready.
	app.listen(PORT, () => {
		console.log(`Listening on port ${PORT}...`);
	});
});

// Set up routes.
app.use(express.static('static'));
app.use('/api', apiRouter);
app.get('/import', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/gpm_import.html'));
});
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/index.html'));
});
