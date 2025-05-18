import type { HistoryEntry } from "./types";

declare global {
	interface Window {
		electronAPI: {
			getFileList: () => HistoryEntry[];
			readFiles: (dir: string) => Promise<{ files: { content: string }[] }>
		}
	}
};
