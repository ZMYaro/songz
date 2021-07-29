'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const userSchema = new Schema({
	googleId: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
