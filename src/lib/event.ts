export const dispatchNamedEvent = <T>(eventName: string, data?: T) => {
	const targetEvent = new CustomEvent(eventName, { detail: data });
	document.dispatchEvent(targetEvent);
};

export const listenNamedEvent = (
	eventName: string,
	callback: (e: CustomEvent) => void,
) => {
	document.addEventListener(eventName, (e) => {
		callback(e as CustomEvent);
	});
};
