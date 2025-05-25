import { useContext, useState } from "react";
import Title from "./title";
import { DialogContext } from "../context";
import { Button, Label, Text } from "@fluentui/react-components";
import { useAppstore } from "@/store";

const Notification = () => {
	const { setDialog } = useContext(DialogContext);
	const { projectPath } = useAppstore();

	return (
		<div className="flex-1 flex flex-col">
			<Title />
			<div className="flex flex-1 flex-col mt-6 mx-6 justify-between items-center">
				<div className="flex flex-col w-full">
					<Label size="large">Project Folder Generated</Label>
					<Text
						size={200}
						weight="regular"
						italic
						className="text-gray-300 mt-[4px]"
					>
						Generated folder is located at {projectPath}
					</Text>
					<Text
						size={200}
						weight="regular"
						italic
						className="text-gray-300 mt-[4px]"
					>
						Please make sure the default config file is well placed at the
						generated folder.
					</Text>
				</div>
				<Button
					className="w-[12rem]"
					onClick={() => {
						setDialog("project-config");
					}}
				>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default Notification;
