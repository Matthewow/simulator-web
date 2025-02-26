import type { GeoPosition } from "./types";
import METRO from "@/assets/metro.json";

export type Station = {
	pos: GeoPosition;
	route: Map<string, Array<GeoPosition>>;
};

export const MTR_STATION_MAP: Map<string, Station> = new Map();

const convertCSV2Station = (csvLine: string) => {
	const elements = csvLine.split(",");
	const stationCode = elements[2];
	const stationGeoPos = {
		lat: Number.parseFloat(elements[6]),
		lng: Number.parseFloat(elements[7]),
	};
	MTR_STATION_MAP.set(stationCode, { pos: stationGeoPos, route: new Map() });
};

for (const csvLine of METRO.mtr) {
	convertCSV2Station(csvLine);
}
