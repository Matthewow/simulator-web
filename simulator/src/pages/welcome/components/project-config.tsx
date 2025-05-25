import { Input, Label, Button, Switch } from "@fluentui/react-components";
import Title from "./title";
import { useAppstore } from "@/store";
import { useContext, useState } from "react";
import { DialogContext } from "../context";
import { getSimulationStatus, setConfig, startSimulation } from "@/api";

const ProjectConfig = () => {
	const { setPage, setProgress, clearProgress } = useAppstore((state) => state);

	const { setDialog } = useContext(DialogContext);

	const [inputs, setInputs] = useState({
		tInitial: 21600,
		tEnd: 25200,
		taxiDriverSamplePercentage: 10,
		taxiOrderSamplePercentage: 20,
		privateCarsSamplePercentage: 30,
		multimodelTransit: false,
	});

	const onClick = async () => {
		setDialog("loading");
		await setConfig({
			"simulation.tInitial": inputs.tInitial,
			"simulation.tEnd": inputs.tEnd,
			"simulation.taxiDriverSamplePercentage":
				inputs.taxiDriverSamplePercentage,
			"simulation.taxiOrderSamplePercentage": inputs.taxiOrderSamplePercentage,
			"simulation.privateCarsSamplePercentage":
				inputs.privateCarsSamplePercentage,
			"simulation.multimodal.transit": inputs.multimodelTransit ? "on" : "off",
		});
		await startSimulation();

		let status = "RUNNING";
		while (status === "RUNNING") {
			const res = await getSimulationStatus();
			status = res.status;
			setProgress(res.progress);
			if (status !== "RUNNING") {
				break;
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		clearProgress();
		setPage("traffic");
	};
	return (
		<div className="flex-1 flex flex-col">
			<Title />

			<div className="flex flex-1 flex-col  justify-between items-center">
				<div className="flex flex-col flex-1 min-w-[28rem] justify-center my-4 gap-y-2">
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">tInitial</Label>
						<Input
							size="small"
							value={inputs.tInitial.toString()}
							type="number"
							onChange={(e) => {
								const number = Number.parseInt(e.target.value);
								if (Number.isNaN(number)) {
									return;
								}

								setInputs({
									...inputs,
									tInitial: number,
								});
							}}
						/>
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">tEnd</Label>
						<Input
							size="small"
							value={inputs.tEnd.toString()}
							type="number"
							onChange={(e) => {
								const number = Number.parseInt(e.target.value);
								if (Number.isNaN(number)) {
									return;
								}

								setInputs({
									...inputs,
									tEnd: number,
								});
							}}
						/>
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">taxiDriverSamplePercentage</Label>{" "}
						<Input
							size="small"
							type="number"
							value={inputs.taxiDriverSamplePercentage.toString()}
							onChange={(e) => {
								const number = Number.parseInt(e.target.value);
								if (Number.isNaN(number)) {
									return;
								}

								setInputs({
									...inputs,
									taxiDriverSamplePercentage: number,
								});
							}}
						/>
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">taxiOrderSamplePercentage</Label>{" "}
						<Input
							size="small"
							value={inputs.taxiOrderSamplePercentage.toString()}
							type="number"
							onChange={(e) => {
								const number = Number.parseInt(e.target.value);
								if (Number.isNaN(number)) {
									return;
								}

								setInputs({
									...inputs,
									taxiOrderSamplePercentage: number,
								});
							}}
						/>
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">privateCarsSamplePercentage</Label>{" "}
						<Input
							size="small"
							value={inputs.privateCarsSamplePercentage.toString()}
							onChange={(e) => {
								const number = Number.parseInt(e.target.value);
								if (Number.isNaN(number)) {
									return;
								}
								setInputs({
									...inputs,
									privateCarsSamplePercentage: number,
								});
							}}
							type="number"
						/>
					</div>
					<div className="flex flex-row justify-between w-full">
						<Label weight="semibold">multimodal.transit</Label>{" "}
						<Switch
							checked={inputs.multimodelTransit}
							onChange={(e) => {
								setInputs({
									...inputs,
									multimodelTransit: e.target.checked,
								});
							}}
						/>
					</div>

					{/* <div className="flex flex-row justify-between w-full">
						<Label weight="semibold">simulateIterations</Label>{" "}
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
					</div> */}
				</div>
				<Button className="w-[12rem]" onClick={onClick}>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default ProjectConfig;
