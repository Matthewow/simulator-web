import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { readFileAsync } from "./utils";

export type DataInputHandle = {
	triggerUploadDialog: () => void;
};

const DataInput = forwardRef<DataInputHandle, unknown>((_props, ref) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	useImperativeHandle(ref, () => ({
		triggerUploadDialog: () => {
			fileInputRef.current?.click();
		},
	}));

	//Mount event handler for file upload
	useEffect(() => {
		const fileElement = fileInputRef.current;
		if (fileElement) {
			fileInputRef.current.addEventListener("change", async () => {
				const file = fileElement?.files?.[0];
				if (file) {
					const rawData = readFileAsync(file);
					console.log(rawData);
				} else
					console.warn(
						"The upload file is missing. Skip the following processes.",
					);
			});
		} else {
			console.error("The file input element is unexpectedly missing.");
		}
	}, []);

	//Place input element here to trigger file reader and corresponding functions
	return <input type="file" style={{ display: "none" }} ref={fileInputRef} />;
});

export default DataInput;
