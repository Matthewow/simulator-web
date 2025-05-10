import { useAppstore } from "@/store";
import Overlay from "./components/overlay";
import TopBar from "./components/top_bar";
import MapProvider from "./components/map";
import Timeline from "./components/timeline";
import Chart from "./components/chart";

const TrafficPage = () => {
	const { dataStatus, statistic } = useAppstore((state) => state);
	return (
		<div className="flex h-100vh max-h-100vh overflow-hidden justify-center flex-col">
			<Overlay />
			<div className="flex flex-basis-[3rem] flex-grow-0 flex-shrink-0 items-center z-2">
				<TopBar />
			</div>
			<div className="flex-1 min-h-0 relative flex-row flex">
				<div className="flex-basis-[42rem] flex-grow-0 flex-shrink-0 border-solid border border-black py-[2rem] flex flex-col">
					{Object.entries(statistic).map(([key, value]) => {
						return (
							<div
								key={key}
								className="flex-1 flex justify-center items-center mr-[2rem] flex flex-col"
							>
								<h3>{key}</h3>
								<Chart data={value} />
							</div>
						);
					})}
				</div>
				<div className="flex-1 min-h-0 relative ">
					<MapProvider />
				</div>
			</div>

			<div className="flex-basis-[12rem] flex-grow-0 flex-shrink-0">
				{dataStatus === "Ready" && <Timeline />}
			</div>
		</div>
	);
};

export default TrafficPage;
