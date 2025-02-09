import { useEffect } from "react";

import { dispatchNamedEvent } from "@lib/event";

const MapProvider = () => {
	useEffect(() => {
		dispatchNamedEvent("init_google_map");
	}, []);

	return <div id="map" className="w-full h-full" />;
};

export default MapProvider;
