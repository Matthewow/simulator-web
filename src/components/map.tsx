import { useEffect } from "react";

import { initGoogleMap } from "@/lib/render";
import { preparePLYs, prepareSVGs } from "@/lib/marker";
import { loadDataSet } from "@/lib/dataset";
import { useAppstore } from "@/store";

const MapProvider = () => {
	const { setDataStatus, setDataset } = useAppstore((state) => state);
	useEffect(() => {
		(async () => {
			setDataStatus("Loading");
			await Promise.all([initGoogleMap(), prepareSVGs(), preparePLYs()]);
			const dataset = await loadDataSet();
			setDataset(dataset);
		})();
	}, [setDataStatus, setDataset]);

	return <div id="map" className="w-full h-full" />;
};

export default MapProvider;
