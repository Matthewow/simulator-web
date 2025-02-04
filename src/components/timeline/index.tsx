import CompoundButton from "./compound";

const Timeline = () => {
	return (
		<div className="flex flex-col h-full  p-[0.5rem] box-border ">
			<div className="flex flex-row justify-center items-center flex-basis-[2rem] flex-grow-0">
				<CompoundButton />
			</div>
			<div className="flex-1">
				<div>TimeTrack</div>
			</div>
		</div>
	);
};

export default Timeline;
