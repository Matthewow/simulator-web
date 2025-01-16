export const isNumber = (value: unknown) => {
	return typeof value === "number";
};

export const isValidNumber = (value: number) => {
	return isNumber(value) && !Number.isNaN(value) && Number.isFinite(value);
};
