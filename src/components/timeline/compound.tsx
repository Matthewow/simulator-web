import {
	Pause20Regular,
	Play20Regular,
	FlashPlay20Regular,
} from "@fluentui/react-icons";
import { type PlayStatus, useAppstore } from "../../store";
import { useCallback } from "react";

const CompoundButton = () => {
	const { playStatus, setPlayStatus, dataStatus } = useAppstore(
		(state) => state,
	);

	const getClickHandler = useCallback(
		(status: PlayStatus) => () => {
			if (dataStatus === "Ready") setPlayStatus(status);
		},
		[dataStatus, setPlayStatus],
	);

	return (
		<div className="flex flex-row w-[7rem] h-[1.5rem] items-center border-solid border-[0.6px] rounded-[4px] border-gray-500 overflow-hidden">
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={getClickHandler("Play")}
				className={`flex-1 h-full flex items-center justify-center ${playStatus === "Play" ? "bg-gray-5" : ""}`}
			>
				<Play20Regular />
			</div>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={getClickHandler("FastForward")}
				className={`flex-1 h-full flex items-center justify-center ${playStatus === "FastForward" ? "bg-gray-5" : ""}`}
			>
				<FlashPlay20Regular />
			</div>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={getClickHandler("Pause")}
				className={`flex-1 h-full flex items-center justify-center ${playStatus === "Pause" ? "bg-gray-5" : ""}`}
			>
				<Pause20Regular />
			</div>
		</div>
	);
};

export default CompoundButton;
