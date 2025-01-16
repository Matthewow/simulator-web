import { create } from "zustand";

type DataStatus = "Idle" | "Loading" | "Ready"

type AppState = {
    dataStatus: DataStatus
    setDataStatus: (status: DataStatus) => void
}


export const useAppstore = create<AppState>()((set)=>({
    dataStatus: "Idle",
    setDataStatus: (status) =>set({dataStatus: status})
}))