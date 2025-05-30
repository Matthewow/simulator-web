import { type Object3D, Vector3 } from "three";
import type { ThreeJSOverlayView } from "@googlemaps/three";
import * as TURF from "@turf/turf";

import { isNumber } from "./utils";
import { createPLYGroup, setGroupMaterialColorByStatus } from "./marker";
import type { GeoPosition, SubwayStatus, VehicleStatus } from "./types";
import { MTR_STATION_MAP } from "./railway";
import ViewLayer from "./view_layer";

export type VehicleSnapshot = {
	pos: GeoPosition;
	status: VehicleStatus;
};
export type Route = Map<number, VehicleSnapshot | SubwaySnapshot>;

export interface Transportation {
	updateMarker(timeInSecond: number, overlay: ThreeJSOverlayView): void;
	marker: Object3D;

	route: VehicleRoute | SubwayRoute;
}

export type VehicleType = "Taxi" | "Private Car" | "Bus";
export type VehicleRoute = Map<number, VehicleSnapshot>;
export class Vehicle implements Transportation {
	readonly id: string;

	readonly vtype: VehicleType;
	readonly route: VehicleRoute;

	sequence: Array<number>;
	marker: Object3D;

	constructor(
		id: string,
		type: VehicleType,
		sequence: number[],
		marker: Object3D,
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

		this.marker.visible = !!curGeoPosition;

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

				this.marker.rotation.y = -(heading / 180) * Math.PI;
			}
		}
	}
}

export type SubwayRecord = { timestamp: number; status: SubwayStatus };
export type SubwaySnapshot = {
	startTime: number;
	endTime: number;
	route: {
		from: string;
		to: string;
	};
	status: SubwayStatus;
};
export type SubwayRoute = Map<number, SubwaySnapshot>;
export class Subway implements Transportation {
	readonly id: string;
	readonly route: SubwayRoute;
	readonly sequence: Array<number>;
	readonly marker: Object3D;
	readonly lineCode: string;

	constructor(
		id: string,
		lineCode: string,
		sequence: number[],
		marker: Object3D,
	) {
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

		this.marker.visible = !!snapshot;
		if (!snapshot) {
			return;
		}

		const startStation = MTR_STATION_MAP.get(snapshot?.route.from);
		const startPosition = startStation?.pos;
		const endStation = MTR_STATION_MAP.get(snapshot?.route.to);
		const endPosition = endStation?.pos;
		const status = snapshot?.status;
		const startTime = snapshot?.startTime;
		const endTime = snapshot?.endTime;

		status && setGroupMaterialColorByStatus(this.marker, status);
		if (status === "RUNNING" && currentTimeIndex === this.sequence.length - 1) {
			//Do nothing
		} else if (
			status === "RUNNING" &&
			startPosition &&
			endPosition &&
			startTime &&
			endTime
		) {
			const tweakedEndTime = endTime - (timeInSecond % 5);

			const progress = Math.max(
				1 - tweakedEndTime / (tweakedEndTime + timeInSecond - startTime),
				0,
			);

			const route = startStation.route.get(endStation.code);

			if (route) {
				const length = TURF.length(route, { units: "meters" });

				const along = TURF.along(route, length * progress, { units: "meters" });
				const geoLocation = {
					lat: along.geometry.coordinates[1],
					lng: along.geometry.coordinates[0],
				};

				const nextAlong = TURF.along(
					route,
					length * Math.min(progress + 0.01, 1),
					{
						units: "meters",
					},
				);

				const nextGeoLocation = {
					lat: nextAlong.geometry.coordinates[1],
					lng: nextAlong.geometry.coordinates[0],
				};

				//console.log(snapshot.route, progress, geoLocation);

				const simulatedPosition = overlay.latLngAltitudeToVector3(geoLocation);

				this.marker?.position.copy(simulatedPosition);
				const heading = google.maps.geometry.spherical.computeHeading(
					geoLocation,
					nextGeoLocation,
				);

				this.marker.rotation.y = -(heading / 180) * Math.PI;
			} else {
				console.log(
					`Missing route: from ${snapshot.route.from} to ${snapshot.route.to}, ${snapshot} `,
				);
			}
		} else if (status === "BOARDING" && endPosition) {
			const endGlPosition = overlay.latLngAltitudeToVector3(endPosition);
			this.marker?.position.copy(endGlPosition);
		}
	}
}

export type Dataset = {
	idRouteMap: Map<string, Transportation>;
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
			const idVehicleMap = dataset.idRouteMap as Map<string, Vehicle>;
			const sequence = [] as number[];

			for (const line of lines) {
				const attributes = line.split(",");

				const id = attributes?.[idIndex];
				const type = attributes?.[typeIndex] as VehicleType;
				const pos = {
					lat: Number.parseFloat(attributes?.[posIndex?.[0]]),
					lng: Number.parseFloat(attributes?.[posIndex?.[1]]),
				};
				const timestamp = Number.parseInt(attributes?.[timeStampIndex]);
				const status = attributes?.[statusIndex] as VehicleStatus;

				// Create vehicle or append route if id is valid
				if (id) {
					const id = `v_${attributes?.[idIndex]}`;
					if (!idVehicleMap.has(id)) {
						const group = createPLYGroup(type);
						idVehicleMap.set(id, new Vehicle(id, type, sequence, group));

						switch (type) {
							case "Taxi": {
								ViewLayer.instance?.taxis.add(group);
								break;
							}
							case "Private Car": {
								ViewLayer.instance?.privateCars.add(group);
								break;
							}

							case "Bus": {
								ViewLayer.instance?.buses.add(group);
								break;
							}
							default:
								throw new Error("Unsupported vehicle type");
						}
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
		idRouteMap: new Map<string, Subway>(),
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
			const idSubwayMap = dataset.idRouteMap as Map<string, Subway>;
			const sequence = [] as number[];

			for (const line of lines) {
				const attributes = line.split(",");

				const id = attributes?.[idIndex];
				const lineCode = attributes?.[lineCodeIndex];

				const timestamp = Number.parseInt(attributes?.[timestampIndex]);
				const status = attributes?.[statusIndex] as SubwayStatus;

				const curStationCode = attributes?.[currentStationIndex];

				const nextStationCode = attributes?.[nextStationIndex];

				const startTime = Number.parseFloat(attributes?.[durationIndex?.[0]]);
				const endTime = Number.parseFloat(attributes?.[durationIndex?.[1]]);

				// Create vehicle or append route if id is valid
				if (id) {
					const id = `s_${attributes?.[idIndex]}`;
					if (!idSubwayMap.has(id)) {
						const group = createPLYGroup("subway");
						idSubwayMap.set(id, new Subway(id, lineCode, sequence, group));

						ViewLayer.instance.subway.add(group);
					}

					const snapshot = {
						status,
						route: {
							from: curStationCode,
							to: nextStationCode,
						},
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
			).sort((r, l) => r - l) as Array<number>;

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
	}
	if (isNumber(trainIdIndex)) {
		return parseSubways(lines, definitions);
	}

	throw new Error("Unknown data format");
};

const mergeDataSet = (rd: Dataset, ld: Dataset): Dataset => {
	return {
		idRouteMap: new Map([...rd.idRouteMap, ...ld.idRouteMap]),
		sequence: Array.from(new Set([...rd.sequence, ...ld.sequence])).sort(
			(r, l) => r - l,
		),
	};
};

export const loadDataSet = async (projectPath?: string) => {

	let files: string[];
	if (!projectPath) {
		const res = await Promise.all([fetch("/train.csv"), fetch("/vehicle.csv")]);
		files = await Promise.all(res.map((res) => res.text()));
	} else {
		files = (await window.electronAPI.readFiles(`${projectPath}/Output`)).files.map((file) => file.content)
	}



	const datasets = files.map(parseDataSet);
	for (const dataset of datasets) {
		const sequence = dataset.sequence;
		const startPoint = sequence[0];
		for (let i = 0; i < sequence.length; i++) {
			sequence[i] = sequence[i] - startPoint;
		}

		const idInstanceMap = dataset.idRouteMap;
		for (const [_, instance] of idInstanceMap) {
			const alignedMap = new Map();
			const route = instance.route;
			for (const [timestamp, instance] of route) {
				alignedMap.set(timestamp - startPoint, instance);
			}
			instance.route = alignedMap;
		}
	}

	if (datasets.length === 1)
		return datasets[0];

	return mergeDataSet(datasets[0], datasets[1]);

};
