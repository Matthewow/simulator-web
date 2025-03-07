import type { ThreeJSOverlayView } from "@googlemaps/three";
import type { GeoPosition } from "./types";
import METRO from "@/assets/metro.json";
import STATIONS from "@/assets/station.json";
import { createCircleMesh } from "./marker";

export type Station = {
	pos: GeoPosition;
	route: Map<string, Array<GeoPosition>>;
};

export const MTR_STATION_MAP: Map<string, Station> = new Map();

const getNameAbbrMap = (): Map<string, string> => {
	const nameCodeMap = new Map<string, string>();
	for (const csvLine of METRO.mtr) {
		const elements = csvLine.split(",");

		const stationCode = elements[2];
		const stationName = elements[5];

		nameCodeMap.set(stationName, stationCode);
	}

	return nameCodeMap;
};

export const appendRailwayLayer = (overlay: ThreeJSOverlayView) => {
	for (const [_, station] of MTR_STATION_MAP) {
		const geoLocation = station.pos;
		const glLocation = overlay.latLngAltitudeToVector3(geoLocation);
		const mesh = createCircleMesh();
		mesh.position.copy(glLocation);
		overlay.scene.add(mesh);
	}
};

// Get Abbr and Full name map from metro.json
const nameCodeMap = getNameAbbrMap();

// Get Station Geolocation from staion.json
for (const station of STATIONS) {
	const name = station.properties.name;
	if (nameCodeMap.has(name)) {
		const abbr = nameCodeMap.get(name) as string;
		const geoLocation = station.geometry.coordinates;
		MTR_STATION_MAP.set(abbr, {
			pos: { lat: geoLocation[1], lng: geoLocation[0] },
			route: new Map(),
		});
	}
}
