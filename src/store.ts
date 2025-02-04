import { create } from "zustand";
import type { Dataset } from "./lib/dataset";
import { dispatchNamedEvent } from "./lib/event";

type DataStatus = "Idle" | "Loading" | "Ready";
type PlayStatus = "Pause" | "Play" | "FastForward";

type AppState = {
	dataStatus: DataStatus;
	setDataStatus: (status: DataStatus) => void;
	dataset: Dataset;
	setDataset: (dataset: Dataset) => void;

	playStatus: PlayStatus;
	setPlayStatus: (status: PlayStatus) => void;
};

export const useAppstore = create<AppState>()((set) => ({
	dataStatus: "Idle",
	setDataStatus: (status) => set({ dataStatus: status }),
	dataset: { idRouteMap: new Map(), sequence: [] },
	setDataset: (dataset) => set({ dataset, dataStatus: "Ready" }),

	playStatus: "Play",
	setPlayStatus: (playStatus) => {
		dispatchNamedEvent("play_status_changed", playStatus);
		set({ playStatus });
	},
}));
