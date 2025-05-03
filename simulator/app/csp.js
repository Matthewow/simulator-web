const { session } = require("electron");

const setupCSP = () => {
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": [
					"default-src 'self'; script-src 'self' https://maps.googleapis.com 'wasm-unsafe-eval'; style-src 'self' https://*.googleapis.com 'unsafe-inline'; connect-src 'self' data: https://*.googleapis.com https://maps.gstatic.com; worker-src 'self' blob:; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com data:; font-src 'self' https://fonts.gstatic.com;",
				],
			},
		});
	});
};

module.exports = setupCSP;
