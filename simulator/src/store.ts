import { create } from "zustand";
import type { Dataset } from "./lib/dataset";
import { dispatchNamedEvent } from "./lib/event";

type DataStatus = "Idle" | "Loading" | "Ready";
export type PlayStatus = "Pause" | "Play" | "FastForward" | null;

type AppState = {
	dataStatus: DataStatus;
	setDataStatus: (status: DataStatus) => void;
	dataset: Dataset;
	setDataset: (dataset: Dataset) => void;

	playStatus: PlayStatus;
	setPlayStatus: (status: PlayStatus) => void;

	projectPath: string | null;
	setProjectPath: (projectPath: string) => void;

	page: string;
	setPage: (page: string) => void;

	statistic: Record<string, Record<string, Record<string, number>>>;
	setStatistic: (
		statistic: Record<string, Record<string, Record<string, number>>>,
	) => void;

	progress: number;
	setProgress: (progress: number) => void;
	clearProgress: () => void
};

export const useAppstore = create<AppState>()((set) => ({
	dataStatus: "Idle",
	setDataStatus: (status) => set({ dataStatus: status }),
	dataset: { idRouteMap: new Map(), sequence: [] },
	setDataset: (dataset) => {
		dispatchNamedEvent("render_dataset", dataset);
		set({ dataset, dataStatus: "Ready", playStatus: "Play" });
	},

	playStatus: null,
	setPlayStatus: (playStatus) => {
		dispatchNamedEvent("play_status_changed", playStatus);
		set({ playStatus });
	},

	projectPath: null,
	setProjectPath: (projectPath: string) => {
		set({ projectPath });
	},

	page: "welcome",
	setPage: (page) => {
		set({ page });
	},

	statistic: {},
	setStatistic: (statistic) => set({ statistic }),

	progress: -1,
	setProgress: (progress) => set({ progress }),
	clearProgress: () => set({ progress: -1 })
}));
