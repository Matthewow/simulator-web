import { Vector3, type Mesh } from "three";
import { isNumber, isValidNumber } from "./utils";
import type { ThreeJSOverlayView } from "@googlemaps/three";
import { createMarkerMesh } from "./marker";

export type GeoPosition = { lat: number; lng: number };

export type Snapshot = {
	pos: GeoPosition;
	status: VehicleStatus | SubwayStatus;
};
export type Route = Map<number, Snapshot>;

export interface Transportation {
	appendRoute(timestamp: number, snapshot: Snapshot): void;
	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView): void;

	readonly route: Route;
}

export type VehicleType = "Taxi" | "Private Car";
export type VehicleStatus = "EMPTY" | "OFFLINE" | "BOARDING";
export class Vehicle implements Transportation {
	readonly id: number;

	readonly vtype: VehicleType;
	readonly route: Route;

	sequence: Array<number>;
	marker: Mesh;

	constructor(id: number, type: VehicleType, sequence: number[], marker: Mesh) {
		this.id = id;
		this.vtype = type;
		this.route = new Map();
		this.sequence = sequence;
		this.marker = marker;
	}

	appendRoute(timestamp: number, snapshot: Snapshot) {
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
export class Subway implements Transportation {
	readonly id: string;
	readonly route: Route;
	readonly sequence: Array<number>;
	readonly marker: Mesh;
	readonly lineCode: string;

	constructor(id: string, lineCode: string, sequence: number[], marker: Mesh) {
		this.id = id;
		this.route = new Map();
		this.sequence = sequence;
		this.lineCode = lineCode;
		this.marker = marker;
	}

	appendRoute(timestamp: number, snapshot: Snapshot): void {
		this.route.set(timestamp, snapshot);
	}
	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView): void {
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
			const idRotueMap = dataset.idRouteMap;
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
					if (!idRotueMap.has(id)) {
						idRotueMap.set(
							id,
							new Vehicle(id, type, sequence, createMarkerMesh()),
						);
					}

					const snapshot: Snapshot = { pos, status };
					idRotueMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			const shareSequence = Array.from(
				new Set(
					Array.from(dataset.idRouteMap, ([_, vehicle]) =>
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
	const dataset: Dataset = { idRouteMap: new Map(), sequence: [] };

	const idIndex = definitions.get("Train ID");
	const lineCodeIndex = definitions.get("Line Code");

	const posIndex = [
		definitions.get("Current Station Lat"),
		definitions.get("Current Station Lng"),
	];
	const statusIndex = definitions.get("Current Status");
	const timestampIndex = definitions.get("Timestamp");

	if (
		isNumber(idIndex) &&
		isNumber(lineCodeIndex) &&
		isNumber(posIndex?.[0]) &&
		isNumber(posIndex?.[1]) &&
		isNumber(statusIndex) &&
		isNumber(timestampIndex)
	) {
		try {
			const idRotueMap = dataset.idRouteMap;
			const sequence = [] as number[];

			for (const line of lines) {
				const attributes = line.split(",");

				const id = Number.parseInt(attributes?.[idIndex]);
				const lineCode = attributes?.[lineCodeIndex];
				const pos = {
					lat: Number.parseFloat(attributes?.[posIndex?.[0]]),
					lng: Number.parseFloat(attributes?.[posIndex?.[1]]),
				};
				const timestamp = Number.parseInt(attributes?.[timestampIndex]);
				const status = attributes?.[statusIndex] as VehicleStatus;

				// Create vehicle or append route if id is valid
				if (isValidNumber(id)) {
					if (!idRotueMap.has(id)) {
						idRotueMap.set(
							id,
							new Subway(id, lineCode, sequence, createMarkerMesh()),
						);
					}

					const snapshot: Snapshot = { pos, status };
					idRotueMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			const shareSequence = Array.from(
				new Set(
					Array.from(dataset.idRouteMap, ([_, vehicle]) =>
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
		console.warn("Missing subways' attributes, bypass following processes.");
	}

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
