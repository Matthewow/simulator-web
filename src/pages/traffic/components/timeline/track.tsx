import { useAppstore } from "@/store";
import { timer } from "@/lib/render";
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
			(count) => width / count > 8,
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
									<div className="absolute text-[11px] top-0 left-[6px] leading-none z-1 text-gray-4 bg-black bg-opacity-50">
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

	const updateHandler = useRef<number>(0);
	const pointerEleRef = useRef<HTMLDivElement | null>(null);

	const isDraggedRef = useRef(false);

	useEffect(() => {
		const update = () => {
			if (!isDraggedRef.current) {
				const second = timer.getElapsedTime();
				const progress = Math.min(
					(second / sequence[sequence.length - 1]) * 100,
					100,
				);

				(pointerEleRef.current as HTMLDivElement).style.left = `${progress}%`;
			}
			updateHandler.current = requestAnimationFrame(update);
		};

		updateHandler.current = requestAnimationFrame(update);

		return () => {
			cancelAnimationFrame(updateHandler.current);
		};
	}, [sequence]);

	useEffect(() => {
		const getProgressByMousePositionX = (x: number) => {
			const containerEle = document.getElementById("time-track");
			const containerRect = containerEle?.getBoundingClientRect() as DOMRect;

			const containerWidth = containerRect.width;
			const cursorRelativeX = Math.min(
				Math.max(0, x - containerRect.left),
				containerWidth,
			);

			return (cursorRelativeX / containerWidth) * 100;
		};

		const mouseMoveHandler = (e: MouseEvent) => {
			if (isDraggedRef.current) {
				(pointerEleRef.current as HTMLDivElement).style.left =
					`${getProgressByMousePositionX(e.clientX)}%`;
			}
		};
		document.onmousemove = mouseMoveHandler;

		const mouseUpHandler = (e: MouseEvent) => {
			if (isDraggedRef.current) {
				isDraggedRef.current = false;

				timer.setTime(
					(sequence[sequence.length - 1] *
						getProgressByMousePositionX(e.clientX)) /
						100,
				);
			}
		};
		document.onmouseup = mouseUpHandler;

		const mouseDownHandler = (e: MouseEvent) => {
			const rect = (
				pointerEleRef.current as HTMLDivElement
			).getBoundingClientRect();

			const isInside =
				e.clientX >= rect.left - 10 &&
				e.clientX <= rect.right + 10 &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom;

			if (isInside) isDraggedRef.current = true;
		};
		document.onmousedown = mouseDownHandler;

		const containerNode = document.getElementById(
			"time-track",
		) as HTMLDivElement;

		const containerMouseClickHandler = (e: MouseEvent) => {
			if (isDraggedRef.current) {
				(pointerEleRef.current as HTMLDivElement).style.left =
					`${getProgressByMousePositionX(e.clientX)}%`;
			}

			timer.setTime(
				(sequence[sequence.length - 1] *
					getProgressByMousePositionX(e.clientX)) /
					100,
			);
		};

		containerNode.onclick = containerMouseClickHandler;

		return () => {
			document.removeEventListener("mousemove", mouseMoveHandler);
			document.removeEventListener("mousedown", mouseDownHandler);
			document.removeEventListener("mouseup", mouseUpHandler);
			containerNode.removeEventListener("click", containerMouseClickHandler);
		};
	}, [sequence]);

	return (
		<div
			ref={pointerEleRef}
			className="absolute h-full w-[4px] bg-gray-3 left-[100px] hover:bg-gray-1"
		/>
	);
};

const TimeTrack = () => {
	return (
		<div
			id="time-track"
			className="flex flex-1 flex-col mx-[2rem] relative select-none"
		>
			<Scale
				durations={[3600, 720, 60, 10, 1]}
				indicatorClassNames={[
					"w-[2px] h-[10px] bg-gray-4",
					"w-[2px] h-[6px] bg-gray-7",
				]}
			/>
			<Pointer />
		</div>
	);
};

export default TimeTrack;
