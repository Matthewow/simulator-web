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
		<>
			<div id="map" className="w-full h-full" />
			<canvas
				id="ui"
				className="absolute w-full h-full top-0 left-0 pointer-events-none"
			/>
			<div className="absolute h-[2rem] top-0 right-[45px] flex flex-row-reverse gap-2 text-black">
				{Object.entries(MARKER_COLOR_MAP).map(([key, value]) => (
					<div key={key} className="flex flex-row items-center gap-2">
						<div
							className="w-4 h-4 rounded-full"
							style={{ backgroundColor: value }}
						/>
						<span>{key}</span>
					</div>
				))}
			</div>
		</>
	);
};

export default MapProvider;
