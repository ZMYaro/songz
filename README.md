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

## Google Music import

If you exported your Google Music library with Google Takeout, you can import your song and playlist metadata into SongZ.

1. Extract the “Google Play Music” file from your Takeout.
2. In SongZ, navigate to `/import`.
3. Follow the prompts to point the importer to your Takeout folder and import your Google Music library into SongZ.

**⚠️ Please note:**

* The importer will not connect the metadata to the corresponding files in your Google Drive.  You will have to do that manually for each song.  <small>_(I am open to suggestions on how to automate that—over 2 years into this project, and I still have not finished relinking my entire library 😓)_</small>
* Because Google Takeout only includes how many times you played each song, not when, all playthroughs from the import will appear as having happened on January 1<sup>st</sup>, 1970.
* Certain special characters in file names may break the importer.  If that happens, you must remove those songs from the Takeout folder, try the import again, and then manually add those songs later.

## Add an individual song

To add an individual song to your SongZ library:

1. In SongZ, navigate to `/add`.
2. Fill out the appropriate fields.
3. Submit the form.

**⚠️ Please note:**
* It is not yet possible for SongZ to extract the ID3 tags from a given file, though that feature is planned.
* If you set a number of prior playthroughs (presumably pulled from a previous music library), they will appear as having happened on January 1<sup>st</sup>, 1970.  There is no interface right now to add prior playthroughs from set dates.

## Add a folder of songs

To add all the songs in a Google Drive folder to your SongZ library:

1. In SongZ, navigate to `/addfolder`.
2. Enter the ID of the Google Drive folder and press “Load”.
3. Wait for all the songs to be loaded in and scanned (this may take some time if there are many files or they are large).
4. Confirm the metadata are all correct, and make changes if needed.
  * SongZ will only connect lyrics or multiple formats of the same song if they have the same file name other than the file extension.
  * If there are multiple image files in the folder, SongZ will assume the first one found is the album art.
5. Submit the form.

## SongZ Wrapped

SongZ does not feature as extensive a year in review interface as Spotify Wrapped, however you can view your top 100 songs for a period of time by navigating to `/wrapped`.  You can specify the range using the `start` and `end` parameters (e.g., `/wrapped?start=2021-12-01&end=2022-01-01`).  You can also limit the number of songs listed using the `count` parameter (e.g., `/wrapped?count=10`).

## Major known issues

* If you leave a song paused long enough, it may not resume when you hit play, and you may need to switch to another song and switch back.  This is due to the way songs are currently fetched from Google Drive.
* If a song is long enough, the next song may not play afterward, and you may need to switch to another song and switch back.  This is due to the way the next song is currently prefetched from Google Drive.
* Songs over 100 MB may not load at all.  This is due to a Google Drive limitation.  You may need to create a more compressed version to use in SongZ.
* Lyrics may not display if they are not made visible to anyone with the link.  This is due to how lyrics are currently fetched from Google Drive.
* If you have a lot of albums, artists, or songs, or a long playlist, those views may take a while to load.  This is due to them currently being loaded all at once instead of in chunks.  In the worst case, the view may not load at all.
* In narrow windows, the side panel may fail to pull out by bezel swipe gesture.  This seems to be a bug with the Polymer drawer component.  The bottom bar button should still toggle the panel regardless.

## Live instance

I do not currently run an instance of SongZ open to the public, however you are absolutely welcome to set up your own personal instance for your own music library!  If you want to use it for something beyond that, you are welcome to reach out to me, and I can see about more formally releasing the code under an open-source license.

## Third-party library credits

* [furigana-markdown-it](https://github.com/iltrof/furigana-markdown-it)
* [ID3.js](https://github.com/43081j/id3)
* [Lit](https://lit.dev)
* [markdown-it](https://github.com/markdown-it/markdown-it)
* [Material Web Components](https://github.com/material-components/material-web)
* [Mongoose](https://mongoosejs.com)
* [Passport](https://www.passportjs.org)
