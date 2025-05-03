import type { HistroyEntry } from "./types";

declare global {
	interface Window {
		electronAPI: {
			getFileList: () => HistroyEntry[];
		};
	}
}
