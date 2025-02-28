import { type Group, Vector3, type Object3D } from "three";
import { isNumber, isValidNumber } from "./utils";
import type { ThreeJSOverlayView } from "@googlemaps/three";
import {
	createCarGroup,
	createSubwayGroup,
	createTaxiGroup,
	setGroupMaterialColorByStatus,
} from "./marker";
import type { GeoPosition, SubwayStatus, VehicleStatus } from "./types";
import { MTR_STATION_MAP } from "./railway";

export type VehicleSnapshot = {
	pos: GeoPosition;
	status: VehicleStatus;
};
export type Route = Map<number, VehicleSnapshot | SubwaySnapshot>;

export interface Transportation {
	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView): void;
	marker: Object3D;
}

export type VehicleType = "Taxi" | "Private Car";
export type VehicleRoute = Map<number, VehicleSnapshot>;
export class Vehicle implements Transportation {
	readonly id: number;

	readonly vtype: VehicleType;
	readonly route: VehicleRoute;

	sequence: Array<number>;
	marker: Group;

	constructor(
		id: number,
		type: VehicleType,
		sequence: number[],
		marker: Group,
	) {
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
		const curSnapshot = this.route.get(currentTime);
		const curGeoPosition = curSnapshot?.pos;
		const curStatus = curSnapshot?.status;

		curStatus && setGroupMaterialColorByStatus(this.marker, curStatus);

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

			// if (
			// 	curGeoPosition.lat !== nextGeoPosition.lat &&
			// 	curGeoPosition.lng !== nextGeoPosition.lng
			// ) {
			// 	const heading = google.maps.geometry.spherical.computeHeading(
			// 		curGeoPosition,
			// 		nextGeoPosition,
			// 	);

			// 	(this.marker as Group).rotation.y = -(heading / 180) * Math.PI;
			// }
		}
	}
}

export type SubwayRecord = { timestamp: number; status: SubwayStatus };
export type SubwaySnapshot = {
	startTime: number;
	endTime: number;
	startPos: GeoPosition;
	endPos: GeoPosition;
	status: SubwayStatus;
};
export type SubwayRoute = Map<number, SubwaySnapshot>;
export class Subway implements Transportation {
	readonly id: number;
	readonly route: SubwayRoute;
	readonly sequence: Array<number>;
	readonly marker: Group;
	readonly lineCode: string;

	constructor(id: number, lineCode: string, sequence: number[], marker: Group) {
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
		const snapshot = this.route.get(currentTime);

		const startPosition = snapshot?.startPos;
		const endPosition = snapshot?.endPos;
		const status = snapshot?.status;
		const startTime = snapshot?.startTime;
		const endTime = snapshot?.endTime;

		status && setGroupMaterialColorByStatus(this.marker, status);

		if (
			status === "RUNNING" &&
			startPosition &&
			endPosition &&
			startTime &&
			endTime
		) {
			const startGlPosition = overlay.latLngAltitudeToVector3(startPosition);
			const endGlPosition = overlay.latLngAltitudeToVector3(endPosition);

			const diff = {
				x: endGlPosition.x - startGlPosition.x,
				z: endGlPosition.z - startGlPosition.z,
			};

			const tweakedEndTime = endTime - (timeInSecond % 5);

			const progress = Math.max(
				1 - tweakedEndTime / (tweakedEndTime + timeInSecond - startTime),
				0,
			);

			const simulatedGlPosition = new Vector3(
				startGlPosition.x + diff.x * progress,
				startGlPosition.y,
				startGlPosition.z + diff.z * progress,
			);

			this.marker?.position.copy(simulatedGlPosition);

			// const heading = google.maps.geometry.spherical.computeHeading(
			// 	startPosition,
			// 	endPosition,
			// );

			// (this.marker as Group).rotation.y = -(heading / 180) * Math.PI;
		} else if (status === "BOARDING" && endPosition) {
			const endGlPosition = overlay.latLngAltitudeToVector3(endPosition);
			this.marker?.position.copy(endGlPosition);
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
						const group =
							type === "Taxi" ? createTaxiGroup() : createCarGroup();
						idVehicleMap.set(
							id,
							new Vehicle(id, type, sequence, group as Group),
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

	const currentStationIndex = definitions.get("Current Station");

	const nextStationIndex = definitions.get("Next Station");

	const statusIndex = definitions.get("Current Status");
	const timestampIndex = definitions.get("Timestamp");
	const durationIndex = [
		definitions.get("Time to Departure"),
		definitions.get("Time to Next Station"),
	];

	if (
		isNumber(idIndex) &&
		isNumber(lineCodeIndex) &&
		isNumber(currentStationIndex) &&
		isNumber(nextStationIndex) &&
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
				const status = attributes?.[statusIndex] as SubwayStatus;

				const curStationCode = attributes?.[currentStationIndex];
				const startPos = MTR_STATION_MAP.get(curStationCode)?.pos;

				const nextStationCode = attributes?.[nextStationIndex];
				const endPos = MTR_STATION_MAP.get(nextStationCode)?.pos;

				const startTime = Number.parseFloat(attributes?.[durationIndex?.[0]]);
				const endTime = Number.parseFloat(attributes?.[durationIndex?.[1]]);

				// Create vehicle or append route if id is valid
				if (isValidNumber(id)) {
					if (!idSubwayMap.has(id)) {
						idSubwayMap.set(
							id,
							new Subway(id, lineCode, sequence, createSubwayGroup() as Group),
						);
					}

					const snapshot = {
						status,
						startPos,
						endPos,
						startTime,
						endTime,
					} as SubwaySnapshot;
					idSubwayMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			const shareSequence = Array.from(
				new Set<number>(
					Array.from(
						idSubwayMap,
						([_, vehicle]) => Array.from(vehicle.route.keys()) as number[],
					).flat(),
				),
			).sort((r: number, l: number) => {
				return r - l;
			}) as Array<number>;

			sequence.push(...shareSequence);

			dataset.sequence = sequence;

			for (const [_id, subway] of idSubwayMap) {
				let lastStatus = null;
				let startPoint = 0;
				for (const [timestamp, snapshot] of subway.route) {
					const curStatus = snapshot.status;
					if (lastStatus === null && curStatus === "RUNNING") {
						//If the real start point is unknown, set it to zero
						snapshot.startTime = 0;
					} else if (lastStatus === "BOARDING" && curStatus === "RUNNING") {
						startPoint = timestamp;
						snapshot.startTime = startPoint;
					} else if (curStatus === "RUNNING") {
						snapshot.startTime = startPoint;
					}
					lastStatus = curStatus;
				}
			}
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
