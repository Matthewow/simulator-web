const FILE_READER = new FileReader();

export const readFileAsync = (file: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		FILE_READER.onloadend = (e) => {
			if (e?.target?.error) {
				reject("File read failed.");
			} else {
				resolve(e?.target?.result as string);
			}
		};
		FILE_READER.readAsText(file);
	});
};
