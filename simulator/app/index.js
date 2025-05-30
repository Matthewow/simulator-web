const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");

const IPCController = require("./ipc");

const createWindow = () => {
	const win = new BrowserWindow({
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			webSecurity: false,
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
		},
	});

	const ipc = new IPCController();
	ipc.initEventListeners();

	//win.maximize();
	win.show();

	win.webContents.openDevTools();

	win.loadURL("http://localhost:3000/");
};

app.whenReady().then(() => {
	createWindow();
});
