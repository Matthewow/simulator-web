import type { GeoPosition } from "./types";

export const isNumber = (value: unknown) => {
	return typeof value === "number";
};

export const isValidNumber = (value: number) => {
	return isNumber(value) && !Number.isNaN(value) && Number.isFinite(value);
};

const angleToRadian = (angle: number) => (angle * Math.PI) / 180;

//ref: https://www.movable-type.co.uk/scripts/latlong.html
export const calculateDirectionAngle = (
	lpos: GeoPosition,
	rpos: GeoPosition,
): number => {
	const [llngInRad, llatInRad, rlngInRad, rlatInrad] = [
		...Object.values(lpos),
		...Object.values(rpos),
	].map(angleToRadian);

	const dLng = rlngInRad - llngInRad;

	const angle = Math.atan2(
		Math.sin(dLng) * Math.cos(rlatInrad),
		Math.cos(llatInRad) * Math.sin(rlatInrad) -
			Math.sin(llatInRad) * Math.cos(rlatInrad) * Math.cos(dLng),
	);

	return (angle + 2 * Math.PI) % (2 * Math.PI);
};