import { Input, Label, Text, Button } from "@fluentui/react-components";
import Title from "./title";

const ProjectConfig = () => {
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
				<Button className="w-[12rem]" onClick={() => {}}>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default ProjectConfig;
