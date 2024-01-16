import {GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_SCOPES} from '/gapi.js';

const GOOGLE_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const gapiInitPromise = initGAPIClient();

let fileURLs = {};

/**
 * Initialize the client API after the library is loaded.
 * @returns {Promise} Resolve after the API has initialized
 */
async function initGAPIClient() {
	await window.gapiLoadPromise;
	await gapi.client.init({
		apiKey: GOOGLE_API_KEY,
		clientId: GOOGLE_CLIENT_ID,
		scope: GOOGLE_SCOPES.join(' '),
		discoveryDocs: [GOOGLE_DISCOVERY_DOC]
	});
}

/**
 * Get the file from Google Drive, attempt to return it with a MediaSource, and create a blob URL for it.
 * @param {String} fileID - The ID of the Google Drive file
 * @param {LitElement} [containingElem] - The element in which the file is being shown
 * @returns {String} The existing blob URL, if any, or a blob URL for a MediaSource.
 */
export function getFileURL(fileID, containingElem) {
	if (fileURLs[fileID]) { return fileURLs[fileID]; }
	
	let mediaSource = new MediaSource(),
		url = URL.createObjectURL(mediaSource);
	
	gapiInitPromise
		.then(() => gapi.client.drive.files.get({
			fileId: fileID,
			alt: 'media'
		}))
		.then((fileRes) => {
			let dataArr = Uint8Array.from(fileRes.body.split('').map((chr) => chr.charCodeAt(0)));
			
			// Make a URL for the complete file for next time.
			let blob = new Blob([dataArr], { type: fileRes.headers['Content-Type'] });
			fileURLs[fileID] = URL.createObjectURL(blob);
			
			if (!MediaSource.isTypeSupported(fileRes.headers['Content-Type'])) {
				// If not allowed to fill in the MediaSource, at least refresh the containing element if one was passed,
				// which will generally cause its images to re-fetch the file and get the new blob URL.
				containingElem?.requestUpdate();
				return;
			}
			
			let sourceBuffer = mediaSource.addSourceBuffer(fileRes.headers['Content-Type']);
			sourceBuffer.addEventListener('updateend', () => mediaSource.endOfStream());
			sourceBuffer.appendBuffer(dataArr);
		});
	
	// Return the MediaSource URL immediately.
	return url;
}
