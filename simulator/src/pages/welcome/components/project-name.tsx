import { Button, Input, Label, Text } from "@fluentui/react-components";
import { useContext, useState } from "react";

import { DialogContext } from "../context";
import Title from "./title";
import { setProject } from "@/api";

const ProjectName = () => {
	const { setDialog } = useContext(DialogContext);
	const [projectName, setProjectName] = useState<string>("");

	const handleOnClick = async () => {
		setDialog("loading");
		await setProject(projectName);
		setDialog("notification");
	};

	return (
		<div className="flex-1 flex flex-col">
			<Title />
			<div className="flex flex-1 flex-col mt-6 mx-6 justify-between items-center">
				<div className="flex flex-col w-full">
					<Label size="large">Project Name</Label>
					<Input
						className="mt-[8px]"
						value={projectName}
						onChange={(e) => {
							setProjectName(e.target.value);
						}}
					/>
					<Text
						size={200}
						weight="regular"
						italic
						className="text-gray-300 mt-[4px]"
					>
						Please notice that the entered project name will affect the
						generated project's folder name.
					</Text>
				</div>
				<Button
					className="w-[12rem]"
					onClick={handleOnClick}
					disabled={!projectName && projectName.length === 0}
				>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default ProjectName;
