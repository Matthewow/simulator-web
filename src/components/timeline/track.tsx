import { useAppstore } from "@/store";
import { timer } from "@lib/render";
import { memo, useEffect, useRef, useState } from "react";

const _formatTime = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	const formattedHours = String(hours).padStart(2, "0");
	const formattedMinutes = String(minutes).padStart(2, "0");
	const formattedSeconds = String(secs).padStart(2, "0");

	return `${hours ? `${formattedHours}:` : ""}${formattedMinutes}:${formattedSeconds}`;
};

type ScaleProps = {
	durations: number[];
	indicatorClassNames: string[];
};

const Scale = memo((props: ScaleProps) => {
	const { durations, indicatorClassNames } = props;

	let sequence = useAppstore((state) => state.dataset.sequence);
	sequence = sequence.map((second) => second - sequence[0]);
	const seconds = sequence[sequence.length - 1];

	const containerRef = useRef<HTMLDivElement | null>(null);
	const [shouldShowIndicator, setShouldShowIndicator] = useState<boolean[]>([]);
	const shouldScaleShow = shouldShowIndicator.length > 0;

	useEffect(() => {
		const { width } = (
			containerRef.current as HTMLDivElement
		).getBoundingClientRect();

		const durationCounts = durations.map((duration) => seconds / duration);

		const tweakShowIndicators = durationCounts.map(
			(count) => width / count > 4,
		);

		while (tweakShowIndicators.filter((value) => value).length > 2) {
			const disableIndex = tweakShowIndicators.findIndex((value) => value);
			tweakShowIndicators[disableIndex] = false;
		}

		setShouldShowIndicator(tweakShowIndicators);
	}, [durations, seconds]);

	return (
		<div
			ref={containerRef}
			className="absolute w-full flex flex-row justify-between h-full"
		>
			{shouldScaleShow &&
				Array.from({ length: seconds }).map((_, index) => {
					const availableDurations = durations.filter(
						(_, index) => shouldShowIndicator[index],
					);

					const durationIndex = availableDurations.findIndex(
						(duration) => index % duration === 0,
					);

					const shouldShow = durationIndex >= 0;
					const className = indicatorClassNames[durationIndex] ?? "";

					return (
						shouldShow && (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<div key={index} className={`${className} relative`}>
								{durationIndex === 0 && (
									<div className="absolute text-[11px] top-0 left-[6px] leading-none z-1 text-gray-5 bg-black bg-opacity-50">
										{_formatTime(index)}
									</div>
								)}
							</div>
						)
					);
				})}
		</div>
	);
});

const Pointer = () => {
	let sequence = useAppstore((state) => state.dataset.sequence);
	sequence = sequence.map((second) => second - sequence[0]);
	sequence.pop();

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
			<Scale
				durations={[3600, 720, 60, 10, 1]}
				indicatorClassNames={[
					"w-[2px] h-[10px] bg-gray-5",
					"w-[2px] h-[6px] bg-gray-7",
				]}
			/>

			{playStatus && <Pointer />}
		</div>
	);
};

export default TimeTrack;
