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

## Using SongZ

I do not currently run an instance of SongZ open to the public, however you are absolutely welcome to set up your own personal instance for your own music library!  If you want to use it for something beyond that, you are welcome to reach out to me, and I can see about more formally releasing the code under an open-source license.

## Third-party library credits

* [furigana-markdown-it](https://github.com/iltrof/furigana-markdown-it)
* [ID3.js](https://github.com/43081j/id3)
* [Lit](https://lit.dev)
* [markdown-it](https://github.com/markdown-it/markdown-it)
* [Material Web Components](https://github.com/material-components/material-web)
* [Mongoose](https://mongoosejs.com)
* [Passport](https://www.passportjs.org)
