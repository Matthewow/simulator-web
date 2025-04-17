import { useAppstore } from "@/store";
import { useEffect, useState } from "react";
import type { HistroyEntry } from "../types";
import {
	Button,
	Caption1,
	Card,
	CardHeader,
	Subtitle1,
	Text,
} from "@fluentui/react-components";

const Welcome = () => {
	const setPage = useAppstore((state) => state.setPage);
	const [history, setHistory] = useState<HistroyEntry[]>([]);

	useEffect(() => {
		const getFileList = async () => {
			const fileList = await window.electronAPI.getFileList();
			setHistory(fileList);
		};
		getFileList();
	}, []);

	return (
		<div className="bg-[#3d3d3d] shadow-md shadow-black w-[50vw] h-[30vw] rounded-md flex flex-row p-4">
			<div className="flex-grow-1.2 flex flex-col items-center justify-center p-5">
				<div className="mb-4">
					<Button
						className="w-[8rem]"
						size="large"
						onClick={() => {
							setPage("traffic");
						}}
					>
						Demo
					</Button>
				</div>

				<Button
					className="w-[8rem]"
					size="large"
					onClick={() => {
						setPage("traffic");
					}}
				>
					Create New
				</Button>
			</div>
			<div className="w-[1px] bg-gray" />
			<div className="flex-grow-2 p-5 overflow-hidden">
				<div className="mb-5">
					<Subtitle1>History</Subtitle1>
				</div>
				{history.map((entry) => (
					<Card size="small" key={JSON.stringify(entry)} className="mb-3">
						<CardHeader
							header={<Text weight="semibold">{entry.fileName}</Text>}
							description={<Caption1>{entry.path}</Caption1>}
						/>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Welcome;
