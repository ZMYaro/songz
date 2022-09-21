(()=>{
	const _define = window.customElements.define.bind(window.customElements)
	window.customElements.define = ((tagName, elementClass) => {
		try {
			return _define(tagName, elementClass);
		}
		catch (err) {
			//console.warn(err);
			console.warn('Duplicate custom element definition caught.');
		}
	}).bind(window.customElements);
})();
