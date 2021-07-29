# SongZ

A web-based music playing app for managing your metadata and playlists while serving your music library files via Google Drive.


## Requirements

* Node.js
* MongoDB
* Git

## Environment variables to set up

1. Create a Google API project with an OAuth 2.0 client ID.
2. Set environment variables `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with the associated values.
3. If not using a local database, set environment variable `MONGDB_URI` with the database URI (`mongodb://...`).

## Set up local instance

1. `git clone https://github.com/ZMYaro/songz.git`
2. `cd songz/app`
3. `npm install`
4. `node index.js`
5. (For now) In MongoDB, create a `User` with `googleId` set to your account's ID.
