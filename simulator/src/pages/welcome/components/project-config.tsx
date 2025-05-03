import { Input, Label, Button } from "@fluentui/react-components";
import Title from "./title";
import { useAppstore } from "@/store";
import { useContext } from "react";
import { DialogContext } from "../context";
import {
	getSimulationStatistics,
	getSimulationStatus,
	setConfig,
	startSimulation,
} from "@/api";

const ProjectConfig = () => {
	const setPage = useAppstore((state) => state.setPage);

	const { setDialog } = useContext(DialogContext);

	const onClick = async () => {
		setDialog("loading");
		await setConfig({
			"simulation.tInitial": 0,
			"simulation.tEnd": 100,
			"simulation.simulateIterations": 100,
			"simulation.taxiDriverSamplePercentage": 0.1,
			"simulation.taxiOrderSamplePercentage": 0,
			"simulation.privateCarsSamplePercentage": 500000,
		});
		await startSimulation();

		let status = "RUNNING";
		while (status === "RUNNING") {
			const res = await getSimulationStatus();
			status = res.status;
			if (status !== "RUNNING") {
				break;
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		const data = await getSimulationStatistics();

		setPage("traffic");
	};
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
				<Button className="w-[12rem]" onClick={onClick}>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default ProjectConfig;
