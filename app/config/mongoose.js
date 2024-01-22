'use strict';

const mongoose = require('mongoose');

const DB_NAME = 'songz',
	MONGODB_URI = process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`;

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', (err) => console.error(`Error connecting to database \u201c${MONGODB_URI}\u201d:`, err));
db.once('open', () => console.log(`Connected to database \u201c${MONGODB_URI}\u201d.`));

module.exports = { db };
