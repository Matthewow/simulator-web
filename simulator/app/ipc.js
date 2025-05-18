const { ipcMain } = require("electron");
const fs = require("node:fs").promises;
const path = require("node:path");

class IPCController {
	static #singleton = null;

	constructor() {
		if (!IPCController.#singleton) {
			this.initEventListeners = () => {
				ipcMain.handle("get-file-list", () =>
					[0, 1, 2, 3].map((num) => ({
						fileName: `Template Project ${num}`,
						path: `Local drive > Documents > ${num}`,
					})),
				);

				ipcMain.handle("get-files", async (_, dirPath) => {
					const stats = await fs.stat(dirPath);
					if (!stats.isDirectory()) {
						return { error: "Path is not a directory" };
					}

					const files = await fs.readdir(dirPath, { withFileTypes: true });
					console.log("Files in directory:", files);
					// Filter CSV files
					const csvFiles = files
						.filter(
							(dirent) =>
								dirent.isFile() &&
								path.extname(dirent.name).toLowerCase() === ".csv",
						)
						.map((dirent) => dirent.name);

					console.log("CSV files:", csvFiles);
					// const fileContents = await Promise.all(
					// 	csvFiles.map(async (dirent) => {
					// 		try {
					// 			const filePath = path.join(dirPath, dirent.name);

					// 			console.log("Reading file:", filePath);
					// 			const content = await fs.readFile(filePath, "utf-8");
					// 			return {
					// 				name: dirent.name,
					// 				content: content,
					// 				error: null,
					// 			};
					// 		} catch (readError) {
					// 			return {
					// 				name: dirent.name,
					// 				content: null,
					// 				error: readError.message,
					// 			};
					// 		}
					// 	}),
					// );

					const fileContents = await Promise.all(
						csvFiles.map(async (file) => {
							const filePath = path.join(dirPath, file);
							console.log("Reading file:", filePath);
							const content = await fs.readFile(filePath, "utf-8");
							return {
								name: file,
								content: content,
								error: null,
							};
						}),
					);

					return { files: fileContents };
				});
			};
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return this;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return IPCController.#singleton;
		}
	}
}

module.exports = IPCController;
