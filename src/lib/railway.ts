import type { ThreeJSOverlayView } from "@googlemaps/three";
import type { GeoPosition } from "./types";

import METRO from "@/assets/metro.json";
import STATIONS from "@/assets/station.json";
import LINES from "@/assets/line.json";

import { createCircleMesh } from "./marker";

export type Station = {
	pos: GeoPosition;
	route: Map<string, Array<GeoPosition>>;
};

export const MTR_STATION_MAP: Map<string, Station> = new Map();
const LINES_GEOMETRY: GeoPosition[][] = new Array();

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

//Get Line Path from line.json
for (const line of LINES) {
	const lineName = line.properties.name;
	let project = line.properties.project as string;
	console.log(1, project);

	project = project?.substring(lineName.length + 1);
	if (project?.includes("–")) {
		const [fromStationName, toStationName] = project.split("–");
		if (nameCodeMap.has(fromStationName) && nameCodeMap.has(toStationName)) {
			const fromStationCode = nameCodeMap.get(fromStationName) as string;
			const toStationCode = nameCodeMap.get(toStationName) as string;

			const fromStation = MTR_STATION_MAP.get(fromStationCode);
			const toStation = MTR_STATION_MAP.get(toStationCode);

			const path = line.geometry.coordinates[0].map(([lng, lat]) => ({
				lat,
				lng,
			}));

			fromStation?.route.set(toStationCode, path);

			const reversed_path = [...path].reverse();
			toStation?.route.set(fromStationCode, reversed_path);

			LINES_GEOMETRY.push(path);
		}
	}
}
