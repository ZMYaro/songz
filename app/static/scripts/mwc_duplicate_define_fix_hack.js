(()=>{
	const _define = window.customElements.define.bind(window.customElements)
	window.customElements.define = ((tagName, elementClass) => {
		try {
			return _define(tagName, elementClass);
		}
		catch (err) {
			console.warn(err);
		}
	}).bind(window.customElements);
})();
