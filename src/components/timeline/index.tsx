import CompoundButton from "./compound";
import DataSelector from "./data_selector";
import TimeTrack from "./track";

const Timeline = () => {
	return (
		<div className="flex flex-col h-full box-border ">
			<div className="my-[0.2rem] mx-[1rem] flex flex-row items-center justify-between flex-basis-[2rem] flex-grow-0">
				<CompoundButton />
				<DataSelector />
			</div>
			<div className="flex flex-1 bg-black">
				<TimeTrack />
			</div>
		</div>
	);
};

export default Timeline;
