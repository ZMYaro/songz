'use strict';

import {LitElement, html} from 'lit';
//import {LitElement, html} from 'https://unpkg.com/lit@2.6.1/index.js?module';

import {httpToJSError} from '../scripts/utils.js';

export class SelfRemovingSnackbar {
	
	elem;
	
	/**
	 * Create a new Snackbar.
	 * @param {String} text
	 */
	constructor(text) {
		this.elem = document.createElement('mwc-snackbar');
		var dismissBtn = document.createElement('mwc-icon-button');
		dismissBtn.icon = 'close';
		dismissBtn.slot = 'dismiss';
		this.elem.labelText = text;
		this.elem.leading = true;
		this.elem.appendChild(dismissBtn);
		document.body.appendChild(this.elem);
		
		this.elem.addEventListener('MDCSnackbar:closed', this.removeElem.bind(this));
		
		this.elem.show();
	}
	
	/**
	 * Remove the snackbar element from the page.
	 */
	removeElem() {
		this.elem.remove();
	}
}

