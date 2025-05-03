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

	page: string;
	setPage: (page: string) => void;
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

	page: "welcome",
	setPage: (page) => {
		set({ page });
	},
}));
