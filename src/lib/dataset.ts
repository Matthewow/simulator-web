import type { Mesh } from "three";
import { calculateDirectionAngle, isNumber, isValidNumber } from "./utils";

export type VehicleType = "Taxi";
export type GeoPosition = { lat: number; lng: number };
export type VehicleStatus = "EMPTY";
export type VehicleSnapshot = {
	pos: GeoPosition;
	status: VehicleStatus;
	angle: number | null;
};
export type VehicleRoute = Map<number, VehicleSnapshot>;

export class Vehicle {
	readonly id: number;

	readonly vtype: VehicleType;
	route: VehicleRoute;
	marker: Mesh | null;

	constructor(id: number, type: VehicleType) {
		this.id = id;
		this.vtype = type;
		this.route = new Map();
		this.marker = null;
	}

	appendRoute(timestamp: number, snapshot: VehicleSnapshot) {
		this.route.set(timestamp, snapshot);
	}
}

export type Dataset = {
	idRouteMap: Map<number, Vehicle>;
	sequence: Array<number>;
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

	const idIndex = definitions.get("vehicle_id");
	const typeIndex = definitions.get("vehicle_type");
	const posIndex = [definitions.get("lat"), definitions.get("lng")];
	const statusIndex = definitions.get("status");
	const timeStampIndex = definitions.get("time");

	const dataset: Dataset = { idRouteMap: new Map(), sequence: [] };
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
						idRotueMap.set(id, new Vehicle(id, type));
					}

					const snapshot: VehicleSnapshot = { pos, status, angle: null };
					idRotueMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			const sequence = Array.from(
				new Set(
					Array.from(dataset.idRouteMap, ([_, vehicle]) =>
						Array.from(vehicle.route.keys()),
					).flat(),
				),
			).sort() as Array<number>;

			dataset.sequence = sequence;

			for (const [_id, vehicle] of idRotueMap) {
				const route = vehicle.route;
				for (let i = 0; i < sequence.length - 1; i++) {
					const curTimestamp = sequence[i];
					const nextTimestamp = sequence[i + 1];

					const curSnapshot = route.get(curTimestamp);
					const curPos = curSnapshot?.pos;
					const nextPos = route.get(nextTimestamp)?.pos;

					if (curSnapshot && nextPos && curPos) {
						const curAngle = calculateDirectionAngle(nextPos, curPos);
						curSnapshot.angle = curAngle;
					}
				}
			}
		} catch (e) {
			//In case of parsing error
			console.error(e);
		}
	} else {
		console.warn("Missing dataset's attributes, bypass following processes.");
	}
	return dataset;
};
