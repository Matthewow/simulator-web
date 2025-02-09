import { useAppstore } from "@/store";
import { timer } from "@lib/render";
import { useEffect, useRef } from "react";

const _formatTime = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const formattedHours = String(hours).padStart(2, "0");
	const formattedMinutes = String(minutes).padStart(2, "0");
	const formattedSeconds = String(secs).padStart(2, "0");

	return `${hours ? `${formattedHours}:` : ""}${formattedMinutes}:${formattedSeconds}`;
};

const Scale = () => {
	let sequence = useAppstore((state) => state.dataset.sequence);
	sequence = sequence.map((second) => second - sequence[0]);

	return (
		<div className="absolute w-full flex flex-row justify-between">
			{sequence.map((second) => {
				return (
					<div className="flex justify-between flex-1 relative" key={second}>
						<div className="absolute left-[4px] text-[0.75rem] leading-[0.75rem] text-gray-2">
							{_formatTime(second)}
						</div>
						<div className="h-[8px] w-[2px] bg-gray-6" />
						<div className="h-[4px] w-[1px] bg-gray-6" />
						<div className="h-[4px] w-[1px] bg-gray-6" />
						<div className="h-[4px] w-[1px] bg-gray-6" />
						<div className="h-[4px] w-[1px] bg-gray-6" />
						<div className="h-[4px] w-[1px] bg-gray-6 invisible" />
					</div>
				);
			})}
		</div>
	);
};

const Pointer = () => {
	let sequence = useAppstore((state) => state.dataset.sequence);
	sequence = sequence.map((second) => second - sequence[0]);

	const updateHandler = useRef<number>(0);
	const pointerEleRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const update = () => {
			const second = timer.getElapsedTime();
			const progress = Math.min(
				(second / sequence[sequence.length - 1]) * 100,
				100,
			);

			(pointerEleRef.current as HTMLDivElement).style.left = `${progress}%`;
			updateHandler.current = requestAnimationFrame(update);
		};

		updateHandler.current = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(updateHandler.current);
		};
	}, [sequence]);
	return (
		<div
			ref={pointerEleRef}
			className="absolute h-full w-[4px] bg-white left-[100px]"
		/>
	);
};

const TimeTrack = () => {
	const playStatus = useAppstore((state) => state.playStatus);
	return (
		<div className="flex flex-1 flex-col mx-[2rem] relative">
			<Scale />
			{playStatus && <Pointer />}
		</div>
	);
};

export default TimeTrack;
