import type { ThreeJSOverlayView } from "@googlemaps/three";
import type { GeoPosition } from "./types";

import METRO from "@/assets/metro.json";
import STATIONS from "@/assets/station.json";
import LINES from "@/assets/line.json";

import { createCircleMesh } from "./marker";
import * as TURF from "@turf/turf";
import type { Feature, GeoJsonProperties, LineString } from "geojson";
import {
	Line2,
	LineGeometry,
	LineMaterial,
} from "three/examples/jsm/Addons.js";
import ViewLayer from "./view_layer";

export type Station = {
	pos: GeoPosition;
	route: Map<string, Feature<LineString, GeoJsonProperties>>;
	code: string;
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

export const calcRailwayLayer = (overlay: ThreeJSOverlayView) => {
	for (const [_, station] of MTR_STATION_MAP) {
		const geoLocation = station.pos;
		const glLocation = overlay.latLngAltitudeToVector3(geoLocation);
		const mesh = createCircleMesh();
		mesh.position.copy(glLocation);
		ViewLayer.instance.stations.add(mesh);
	}

	for (const line of LINES_GEOMETRY) {
		const points = line.map((geoLocation) =>
			overlay.latLngAltitudeToVector3(geoLocation),
		);

		const geometry = new LineGeometry();
		geometry.setPositions(
			points.flatMap((point) => [point.x, point.y, point.z]),
		);

		const material = new LineMaterial({ color: 0x888888, linewidth: 4 });
		const lineMesh = new Line2(geometry, material);
		ViewLayer.instance.paths.add(lineMesh);
	}
};

// Get Abbr and Full name map from metro.json
const nameCodeMap = getNameAbbrMap();

// Get Station Geolocation from staion.json
for (const station of STATIONS) {
	const name = station.properties.name;
	// Filter the station except metros
	if (
		nameCodeMap.has(name) &&
		(station.properties.mode === "Metro" ||
			station.properties.mode === "Light Rail")
	) {
		const abbr = nameCodeMap.get(name) as string;
		const geoLocation = station.geometry.coordinates;
		MTR_STATION_MAP.set(abbr, {
			pos: { lat: geoLocation[1], lng: geoLocation[0] },
			route: new Map(),
			code: abbr,
		});
	}
}

//Get Line Path from line.json
for (const line of LINES) {
	const lineName = line.properties.name;
	let project = line.properties.project as string;

	project = project?.substring(lineName.length + 1);
	if (project?.includes("–")) {
		const [fromStationName, toStationName] = project.split("–");

		if (nameCodeMap.has(fromStationName) && nameCodeMap.has(toStationName)) {
			const fromStationCode = nameCodeMap.get(fromStationName) as string;
			const toStationCode = nameCodeMap.get(toStationName) as string;

			const fromStation = MTR_STATION_MAP.get(fromStationCode);
			const toStation = MTR_STATION_MAP.get(toStationCode);

			const path = line.geometry.coordinates[0] as Array<[number, number]>;

			const geometryPath = path.map(([lng, lat]) => ({
				lat,
				lng,
			}));

			const turfPath = TURF.lineString(path);

			fromStation?.route.set(toStationCode, turfPath);

			const reversedPath = [...line.geometry.coordinates[0]].reverse();
			const reversedTurfPath = TURF.lineString(reversedPath);

			toStation?.route.set(fromStationCode, reversedTurfPath);

			LINES_GEOMETRY.push(geometryPath);
		}
	}
}
