const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
	getFileList: () => ipcRenderer.invoke("get-file-list"),
});
