import { useAppstore } from "@/store";
import Overlay from "./components/overlay";
import TopBar from "./components/top_bar";
import MapProvider from "./components/map";
import Timeline from "./components/timeline";

const TrafficPage = () => {
	const dataStatus = useAppstore((state) => state.dataStatus);
	return (
		<div className="flex h-100vh justify-center flex-col">
			<Overlay />
			<div className="flex flex-basis-[3rem] flex-grow-0 items-center z-2">
				<TopBar />
			</div>
			<div className="flex-1 relative">
				<MapProvider />
			</div>
			{dataStatus === "Ready" && (
				<div className="flex-basis-[12rem]">
					<Timeline />
				</div>
			)}
		</div>
	);
};

export default TrafficPage;
