import { useAppstore } from "@/store";
import Overlay from "./components/overlay";
import TopBar from "./components/top_bar";
import MapProvider from "./components/map";
import Timeline from "./components/timeline";
import Chart from "./components/chart";
import { useState } from "react";

const TrafficPage = () => {
	const { dataStatus, statistic } = useAppstore((state) => state);
	const [showSide, setShowSide] = useState(true);

	const emissions = statistic.emissions;

	return (
		<div className="flex h-100vh max-h-100vh overflow-hidden justify-center flex-col">
			<Overlay />
			<div className="flex flex-basis-[3rem] flex-grow-0 flex-shrink-0 items-center z-2">
				<TopBar />
			</div>
			<div className="flex-1 min-h-0 relative">
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
				<div
					className={`absolute shadow-md ${showSide ? "left-[36rem]" : "left-[0.2rem]"} top-4 w-[2rem] h-[2rem] bg-[#212121] z-12 flex justify-center items-center rounded border-gray-500 border-1 border-solid`}
					onClick={() => setShowSide(!showSide)}
				>
					{showSide ? "<" : ">"}
				</div>
				<div
					className={`${showSide ? "" : "translate-x-[-39rem]"} shadow-md absolute left-2 top-2 bottom-2 rounded-xl w-[38rem] border-solid border border-black py-[2rem] flex flex-col overflow-hidden z-10 bg-[#212121] `}
				>
					{[
						"multimodal_occupancy",
						"passenger_mode_choice",
						"transit_station_crowdedness",
					].map((name) => {
						const data = statistic[name];
						return (
							data && (
								<div
									key={name}
									className="flex-1 flex justify-center items-center mr-[2rem] flex flex-col"
								>
									<h3>{name}</h3>
									<Chart data={statistic[name]} />
								</div>
							)
						);
					})}

					<div className=" flex flex-row justify-between items-center flex-1 overflow-x-auto overflow-y-hidden">
						{emissions &&
							["NO2", "NOx", "CO2", "PM2.5", "VOC", "CO"].map((name) => {
								const data = emissions[name] as unknown as Record<
									string,
									Record<string, number>
								>;
								return (
									data && (
										<div
											key={name}
											className="min-w-full h-full flex justify-center items-center pr-[2rem] flex flex-col box-border"
										>
											<h3>{name}</h3>
											<Chart data={data} />
										</div>
									)
								);
							})}
					</div>
				</div>

				<MapProvider />
			</div>

			<div className="flex-basis-[12rem] flex-grow-0 flex-shrink-0">
				{dataStatus === "Ready" && <Timeline />}
			</div>
		</div>
	);
};

export default TrafficPage;
