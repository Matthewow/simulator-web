import { Vector3, type Mesh } from "three";
import { isNumber, isValidNumber } from "./utils";
import type { ThreeJSOverlayView } from "@googlemaps/three";
import { createArrowMesh } from "./marker";
import type { GeoPosition } from "./types";

export type VehicleSnapshot = {
	pos: GeoPosition;
	status: VehicleStatus;
};
export type Route = Map<number, VehicleSnapshot | SubwaySnapshot>;

export interface Transportation {
	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView): void;
	marker: Mesh;
}

export type VehicleType = "Taxi" | "Private Car";
export type VehicleStatus = "EMPTY" | "OFFLINE" | "BOARDING";
export type VehicleRoute = Map<number, VehicleSnapshot>;
export class Vehicle implements Transportation {
	readonly id: number;

	readonly vtype: VehicleType;
	readonly route: VehicleRoute;

	sequence: Array<number>;
	marker: Mesh;

	constructor(id: number, type: VehicleType, sequence: number[], marker: Mesh) {
		this.id = id;
		this.vtype = type;
		this.route = new Map();
		this.sequence = sequence;
		this.marker = marker;
	}

	appendRoute(timestamp: number, snapshot: VehicleSnapshot) {
		this.route.set(timestamp, snapshot);
	}

	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView) {
		const currentTimeIndex = Math.min(
			Math.floor(timeInSecond / 5),
			this.sequence.length - 1,
		);
		const nextTimeIndex = Math.min(
			currentTimeIndex + 1,
			this.sequence.length - 1,
		);

		const currentTime = this.sequence[currentTimeIndex];
		const curGeoPosition = this.route.get(currentTime)?.pos;

		const nextTime = this.sequence[nextTimeIndex];
		const nextGeoPosition = this.route.get(nextTime)?.pos;

		if (curGeoPosition && nextGeoPosition) {
			const curGlPosition = overlay.latLngAltitudeToVector3(curGeoPosition);
			const nextGlPosition = overlay.latLngAltitudeToVector3(nextGeoPosition);

			const diff = {
				x: nextGlPosition.x - curGlPosition.x,
				z: nextGlPosition.z - curGlPosition.z,
			};

			const simulatedGlPosition = new Vector3(
				curGlPosition.x + (diff.x * (timeInSecond % 5)) / 5,
				curGlPosition.y,
				curGlPosition.z + (diff.z * (timeInSecond % 5)) / 5,
			);

			this.marker?.position.copy(simulatedGlPosition);

			if (
				curGeoPosition.lat !== nextGeoPosition.lat &&
				curGeoPosition.lng !== nextGeoPosition.lng
			) {
				const heading = google.maps.geometry.spherical.computeHeading(
					curGeoPosition,
					nextGeoPosition,
				);

				(this.marker as Mesh).rotation.y = -(heading / 180) * Math.PI;
			}
		}
	}
}

export type SubwayStatus = "BOARDING" | "RUNNING";
export type SubwayRecord = { timestamp: number; status: SubwayStatus };
export type SubwaySnapshot = {
	progress: number;
	startPos: GeoPosition;
	endPos: GeoPosition;
};
export type SubwayRoute = Map<number, SubwaySnapshot>;
export class Subway implements Transportation {
	readonly id: number;
	readonly route: SubwayRoute;
	readonly sequence: Array<number>;
	readonly marker: Mesh;
	readonly lineCode: string;

	constructor(id: number, lineCode: string, sequence: number[], marker: Mesh) {
		this.id = id;
		this.route = new Map();
		this.sequence = sequence;
		this.lineCode = lineCode;
		this.marker = marker;
	}

	appendRoute(timestamp: number, snapshot: SubwaySnapshot): void {
		this.route.set(timestamp, snapshot);
	}
	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView): void {
		const currentTimeIndex = Math.min(
			Math.floor(timeInSecond / 5),
			this.sequence.length - 1,
		);


		const currentTime = this.sequence[currentTimeIndex];
		const progress = this.route.get(currentTime)?.progress;

		const startPosition = this.route.get(currentTime)?.startPos;
		const endPosition = this.route.get(currentTime)?.endPos;


		if (progress && startPosition && endPosition) {
			const startGlPosition = overlay.latLngAltitudeToVector3(startPosition);
			const endGlPosition = overlay.latLngAltitudeToVector3(endPosition);

			const diff = {
				x: endGlPosition.x - startGlPosition.x,
				z: endGlPosition.z - startGlPosition.z,
			};

			const simulatedGlPosition = new Vector3(
				startGlPosition.x + diff.x * progress,
				startGlPosition.y,
				startGlPosition.z + diff.z * progress,
			);

			this.marker?.position.copy(simulatedGlPosition);


			const heading = google.maps.geometry.spherical.computeHeading(
				startPosition,
				endPosition,
			);

			(this.marker as Mesh).rotation.y = -(heading / 180) * Math.PI;

		}
	}
}

export type Dataset = {
	idRouteMap: Map<number, Transportation>;
	sequence: Array<number>;
};

const parseVehicles = (lines: string[], definitions: Map<string, number>) => {
	const dataset: Dataset = { idRouteMap: new Map(), sequence: [] };

	const idIndex = definitions.get("vehicle_id");
	const typeIndex = definitions.get("vehicle_type");
	const posIndex = [definitions.get("lat"), definitions.get("lng")];
	const statusIndex = definitions.get("status");
	const timeStampIndex = definitions.get("time");

	if (
		isNumber(idIndex) &&
		isNumber(typeIndex) &&
		isNumber(posIndex?.[0]) &&
		isNumber(posIndex?.[1]) &&
		isNumber(statusIndex) &&
		isNumber(timeStampIndex)
	) {
		try {
			const idVehicleMap = dataset.idRouteMap as Map<number, Vehicle>;
			const sequence = [] as number[];

			for (const line of lines) {
				const attributes = line.split(",");

				const id = Number.parseInt(attributes?.[idIndex]);
				const type = attributes?.[typeIndex] as VehicleType;
				const pos = {
					lat: Number.parseFloat(attributes?.[posIndex?.[0]]),
					lng: Number.parseFloat(attributes?.[posIndex?.[1]]),
				};
				const timestamp = Number.parseInt(attributes?.[timeStampIndex]);
				const status = attributes?.[statusIndex] as VehicleStatus;

				// Create vehicle or append route if id is valid
				if (isValidNumber(id)) {
					if (!idVehicleMap.has(id)) {
						idVehicleMap.set(
							id,
							new Vehicle(id, type, sequence, createArrowMesh()),
						);
					}

					const snapshot = { pos, status };
					idVehicleMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			const shareSequence = Array.from(
				new Set(
					Array.from(idVehicleMap, ([_, vehicle]) =>
						Array.from(vehicle.route.keys()),
					).flat(),
				),
			).sort() as Array<number>;

			sequence.push(...shareSequence);

			dataset.sequence = sequence;
		} catch (e) {
			//In case of parsing error
			console.error(e);
		}
	} else {
		console.warn("Missing vehicles' attributes, bypass following processes.");
	}

	return dataset;
};

const parseSubways = (lines: string[], definitions: Map<string, number>) => {
	const dataset: Dataset = {
		idRouteMap: new Map<number, Subway>(),
		sequence: [],
	};

	const idIndex = definitions.get("Train ID");
	const lineCodeIndex = definitions.get("Line Code");

	const currentStationIndex = [
		definitions.get("Current Station Lat"),
		definitions.get("Current Station Lng"),
	];
	const nextStationIndex = [
		definitions.get("Next Station Lat"),
		definitions.get("Next Station Lng"),
	];
	const statusIndex = definitions.get("Current Status");
	const timestampIndex = definitions.get("Timestamp");
	const durationIndex = [
		definitions.get("Time to Departure"),
		definitions.get("Time to Next Station"),
	]

	if (
		isNumber(idIndex) &&
		isNumber(lineCodeIndex) &&
		isNumber(currentStationIndex?.[0]) &&
		isNumber(currentStationIndex?.[1]) &&
		isNumber(nextStationIndex?.[0]) &&
		isNumber(nextStationIndex?.[1]) &&
		isNumber(statusIndex) &&
		isNumber(timestampIndex) &&
		isNumber(durationIndex?.[0]) &&
		isNumber(durationIndex?.[1])
	) {
		try {
			const idSubwayMap = dataset.idRouteMap as Map<number, Subway>;
			const sequence = [] as number[];

			for (const line of lines) {
				const attributes = line.split(",");

				const id = Number.parseInt(attributes?.[idIndex]);
				const lineCode = attributes?.[lineCodeIndex];

				const timestamp = Number.parseInt(attributes?.[timestampIndex]);
				const status = attributes?.[statusIndex] as VehicleStatus;

				const startPos = {
					lat: Number.parseFloat(attributes?.[currentStationIndex?.[0]]),
					lng: Number.parseFloat(attributes?.[currentStationIndex?.[1]]),
				};
				const endPos = {
					lat: Number.parseFloat(attributes?.[nextStationIndex?.[0]]),
					lng: Number.parseFloat(attributes?.[nextStationIndex?.[1]]),
				};

				const time2Start = Number.parseFloat(attributes?.[durationIndex?.[0]]);
				const time2Arrive = Number.parseFloat(attributes?.[durationIndex?.[1]]);

				const progress = status === "BOARDING" ? 0 : (timestamp - time2Start) / (time2Arrive - time2Start);

				// Create vehicle or append route if id is valid
				if (isValidNumber(id)) {
					if (!idSubwayMap.has(id)) {
						idSubwayMap.set(
							id,
							new Subway(id, lineCode, sequence, createArrowMesh()),
						);
					}

					const snapshot = { status, startPos, endPos, progress };
					idSubwayMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			const shareSequence = Array.from(
				new Set<number>(
					Array.from(idSubwayMap, ([_, vehicle]) =>
						Array.from(vehicle.route.keys()) as number[],
					).flat(),
				),
			).sort((r: number, l: number) => {
				return r - l;
			}) as Array<number>;

			sequence.push(...shareSequence);

			dataset.sequence = sequence;
		} catch (e) {
			//In case of parsing error
			console.error(e);
		}
	} else {
		console.warn("Missing subways' attributes, bypass following processes.");
	}
	console.log(dataset);
	return dataset;
};

export const parseDataSet = (raw: string) => {
	const lines = raw.split(/\r\n|\r|\n/);

	const definitions = new Map<string, number>();
	lines
		?.shift()
		?.split(",")
		.forEach((value, index) => {
			definitions.set(value, index);
		});

	const typeIndex = definitions.get("vehicle_type");
	const trainIdIndex = definitions.get("Train ID");

	if (isNumber(typeIndex)) {
		return parseVehicles(lines, definitions);
	} else if (isNumber(trainIdIndex)) {
		return parseSubways(lines, definitions);
	}

	throw new Error("Unknown data format");
};
