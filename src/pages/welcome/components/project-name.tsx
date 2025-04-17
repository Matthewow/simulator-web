import {
	Button,
	Input,
	Label,
	Subtitle1,
	Text,
} from "@fluentui/react-components";
import { ArrowCircleLeftRegular } from "@fluentui/react-icons";
import { useContext } from "react";
import { DialogContext } from "../context";

const ProjectName = () => {
	const { setDialog } = useContext(DialogContext);

	return (
		<div className="w-full h-full flex flex-col">
			<div className="flex flex-row items-center">
				<ArrowCircleLeftRegular
					fontSize={24}
					className="mr-2"
					onClick={() => {
						setDialog("welcome");
					}}
				/>
				<Subtitle1>Create Project</Subtitle1>
			</div>
			<div className="flex flex-1 flex-col mt-6 mx-6 justify-between items-center">
				<div className="flex flex-col w-full">
					<Label size="large">Project Name</Label>
					<Input className="mt-[8px]" />
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
				<Button className="w-[12rem]">Continue</Button>
			</div>
		</div>
	);
};

export default ProjectName;
