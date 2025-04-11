const { ipcMain } = require("electron");

class IPCController {
	static #singleton = null;

	constructor() {
		if (!IPCController.#singleton) {
			this.initEventListeners = () => {
				ipcMain.handle("get-file-list", () =>
					[0, 1, 2, 3].map((num) => ({
						fileName: `Tempate Project ${num}`,
						path: `Local drive > Documents > ${num}`,
					})),
				);
			};
			return this;
		} else {
			return IPCController.#singleton;
		}
	}
}

module.exports = IPCController;
