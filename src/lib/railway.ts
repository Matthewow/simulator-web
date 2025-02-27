import type { ThreeJSOverlayView } from "@googlemaps/three";
import type { GeoPosition } from "./types";
import METRO from "@/assets/metro.json";
import { createCircleMesh } from "./marker";

export type Station = {
	pos: GeoPosition;
	route: Map<string, Array<GeoPosition>>;
};

export const MTR_STATION_MAP: Map<string, Station> = new Map();

const convertCSV2Station = (csvLine: string) => {
	const elements = csvLine.split(",");
	const stationCode = elements[2];
	const stationGeoPos = {
		lat: Number.parseFloat(elements[7]),
		lng: Number.parseFloat(elements[8]),
	};
	MTR_STATION_MAP.set(stationCode, { pos: stationGeoPos, route: new Map() });
};

for (const csvLine of METRO.mtr) {
	convertCSV2Station(csvLine);
}

export const appendRailwayLayer = (overlay: ThreeJSOverlayView) => {
	for (const [_, station] of MTR_STATION_MAP) {
		const geoLocation = station.pos;
		const glLocation = overlay.latLngAltitudeToVector3(geoLocation);

		const mesh = createCircleMesh();
		mesh.position.copy(glLocation);

		overlay.scene.add(mesh);
	}
};
