import { Input, Label, Button } from "@fluentui/react-components";
import Title from "./title";
import { useAppstore } from "@/store";
import { useContext } from "react";
import { DialogContext } from "../context";

const ProjectConfig = () => {
	const setPage = useAppstore((state) => state.setPage);

	const { setDialog } = useContext(DialogContext);
	return (
		<div className="flex-1 flex flex-col">
			<Title />

			<div className="flex flex-1 flex-col  justify-between items-center">
				<div className="flex flex-col flex-1 min-w-[28rem] justify-center my-4 gap-y-2">
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">tInitial</Label> <Input size="small" />
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">tEnd</Label> <Input size="small" />
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">simulateIterations</Label>{" "}
						<Input size="small" />
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">taxiDriverSamplePercentage</Label>{" "}
						<Input size="small" />
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">privateCarsSamplePercentage</Label>{" "}
						<Input size="small" />
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">taxiDriverSamplePercentage</Label>{" "}
						<Input size="small" />
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">multimodal.transit</Label>{" "}
						<Input size="small" />
					</div>
				</div>
				<Button
					className="w-[12rem]"
					onClick={() => {
						setDialog("loading");
						setTimeout(() => {
							setPage("traffic");
						}, 1500);
					}}
				>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default ProjectConfig;
