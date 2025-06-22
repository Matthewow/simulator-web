import { useEffect } from "react";

import { initGoogleMap, initVehicleSampleLayer } from "@/lib/render";
import { MARKER_COLOR_MAP, preparePLYs, prepareTexture } from "@/lib/marker";
import { loadDataSet } from "@/lib/dataset";
import { useAppstore } from "@/store";
import loadStatistic from "@/lib/statistic";

const MapProvider = () => {
	const { setDataStatus, setDataset, setStatistic, projectPath } = useAppstore(
		(state) => state,
	);
	useEffect(() => {
		(async () => {
			setDataStatus("Loading");
			await Promise.all([initGoogleMap(), preparePLYs(), prepareTexture()]);
			initVehicleSampleLayer();

			const statistic = await loadStatistic();
			setStatistic(statistic);

			const dataset = await loadDataSet(projectPath ?? undefined);
			setDataset(dataset);
		})();
	}, [setDataStatus, setDataset, setStatistic, projectPath]);

	return (
		<div className="flex-1 relative">
			<div id="map" className="w-full h-full" />
			<canvas
				id="ui"
				className="absolute w-full h-full top-0 left-0 pointer-events-none"
			/>

			<div className="absolute h-[2rem] top-[25px] right-[210px] flex flex-row-reverse gap-2 text-black">
				<span>Metro</span>
			</div>
			<div className="absolute h-[2rem] top-[60px] right-[30px] flex flex-row-reverse gap-2 text-black">
				<span>Running &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Boarding</span>
			</div>
			<div className="absolute h-[2rem] top-[80px] right-[210px] flex flex-row-reverse gap-2 text-black">
				<span>Bus</span>
			</div>
			<div className="absolute h-[2rem] top-[105px] right-[65px] flex flex-row-reverse gap-2 text-black">
				<span>Running &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Boarding</span>
			</div>
			<div className="absolute h-[2rem] top-[135px] right-[210px] flex flex-row-reverse gap-2 text-black">
				<span>Taxi</span>
			</div>
			<div className="absolute h-[rem] top-[160px] right-[0px] flex flex-row-reverse gap-2 text-black">
				<span>Delivery Picking up Empty Cruising</span>
			</div>
			<div className="absolute h-[2rem] top-[185px] right-[210px] flex flex-row-reverse gap-2 text-black">
				<span>Private Car</span>
			</div>
			<div className="absolute h-[rem] top-[210px] right-[160px] flex flex-row-reverse gap-2 text-black">
				<span>Delivery</span>
			</div>
		</div>
	);
};

export default MapProvider;
