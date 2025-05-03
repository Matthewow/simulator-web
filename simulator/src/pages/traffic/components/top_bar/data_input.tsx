import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { readFileAsync } from "./utils";
import { useAppstore } from "@/store";
import { parseDataSet } from "@/lib/dataset";

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

	const { setDataStatus, setDataset } = useAppstore((state) => state);

	//Mount event handler for file upload
	useEffect(() => {
		const fileElement = fileInputRef.current;
		if (fileElement) {
			fileInputRef.current.addEventListener("change", async () => {
				const file = fileElement?.files?.[0];
				if (file) {
					try {
						setDataStatus("Loading");
						const rawData = await readFileAsync(file);
						const dataset = parseDataSet(rawData);
						setDataset(dataset);
					} catch (e) {
						console.error(e);
					}
				} else
					console.warn(
						"The upload file is missing. Skip the following processes.",
					);
			});
		} else {
			console.error("The file input element is unexpectedly missing.");
		}
	}, [setDataStatus, setDataset]);

	//Place input element here to trigger file reader and corresponding functions
	return <input type="file" className="hidden" ref={fileInputRef} />;
});

export default DataInput;
