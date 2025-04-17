import { createContext } from "react";

export type DialogEnum = "welcome";
export type DialogContextValue = {
	dialog: DialogEnum;
	setDialog: (dialog: DialogEnum) => void;
};

export const DialogContext = createContext<DialogContextValue>({
	dialog: "welcome",
	setDialog: (_dialog: DialogEnum) => {},
});
