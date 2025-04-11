const { session } = require("electron");

const setupCSP = () => {
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"Content-Security-Policy": [
					"default-src 'self'; script-src 'self';style-src 'self' 'unsafe-inline';",
				],
			},
		});
	});
};

module.exports = setupCSP;
