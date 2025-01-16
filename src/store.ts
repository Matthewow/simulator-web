import { create } from "zustand";
import type { Dataset } from "./lib/dataset";

type DataStatus = "Idle" | "Loading" | "Ready";

type AppState = {
	dataStatus: DataStatus;
	setDataStatus: (status: DataStatus) => void;
	dataset: Dataset;
	setDataset: (dataset: Dataset) => void;
};

export const useAppstore = create<AppState>()((set) => ({
	dataStatus: "Idle",
	setDataStatus: (status) => set({ dataStatus: status }),
	dataset: { idRouteMap: new Map(), sequence: [] },
	setDataset: (dataset) => set({ dataset, dataStatus: "Ready" }),
}));
