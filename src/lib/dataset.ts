import { isNumber, isValidNumber } from "./utils";

export type VehicleType = "Taxi";
export type GeoPosition = { lat: number; lng: number };
export type VehicleStatus = "EMPTY";
export type VehicleSnapshot = { pos: GeoPosition; status: VehicleStatus };
export type VehicleRoute = Map<number, VehicleSnapshot>;

export class Vehicle {
	readonly id: number;

	readonly vtype: VehicleType;
	route: VehicleRoute;

	constructor(id: number, type: VehicleType) {
		this.id = id;
		this.vtype = type;
		this.route = new Map();
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

				// Create vehecle or append route if id is valid
				if (isValidNumber(id)) {
					if (!idRotueMap.has(id)) {
						idRotueMap.set(id, new Vehicle(id, type));
					}

					const snapshot: VehicleSnapshot = { pos, status };
					idRotueMap.get(id)?.appendRoute(timestamp, snapshot);
				}
			}

			dataset.sequence = Array.from(
				new Set(
					Array.from(dataset.idRouteMap, ([_, vehecle]) =>
						Array.from(vehecle.route.keys()),
					).flat(),
				),
			).sort() as Array<number>;

			console.log(dataset);
		} catch (e) {
			//In case of parsing error
			console.error(e);
		}
	} else {
		console.warn("Missing dataset's attributes, bypass following processes.");
	}
	return dataset;
};
