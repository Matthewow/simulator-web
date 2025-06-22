import { useAppstore } from "@/store";
import { memo, useCallback } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Legend,
	ResponsiveContainer,
} from "recharts";

interface ChartProps {
	data: Record<string, Record<string, number>>;
}
const Chart = (props: ChartProps) => {
	const simulation = useAppstore((state) => state.simulation);

	const { data } = props;

	const lineNames = Object.keys(data);
	const lines = Object.values(data);

	const xMaxIndex = Math.max(...lines.map((line) => Object.keys(line).length));

	const mappedData = [];
	for (let i = 1; i <= xMaxIndex; i++) {
		const key = i.toString();
		const node: Record<string, string | number> = {
			x: key,
		};

		if (
			simulation["simulation.tInitial"] != null &&
			simulation["simulation.tEnd"] != null
		) {
			//remap i from [1, xMaxIndex] to [tinital, tEnd]
			const xValue =
				simulation["simulation.tInitial"] +
				((i - 1) *
					(simulation["simulation.tEnd"] - simulation["simulation.tInitial"])) /
					(xMaxIndex - 1);
			// convert time in seconds to pretty format
			const hours = Math.floor(xValue / 3600);
			const minutes = Math.floor((xValue % 3600) / 60);
			//const seconds = Math.floor(xValue % 60);
			node.x = `${hours.toString().padStart(2, "0")}:${minutes
				.toString()
				.padStart(2, "0")}`;
			//:${seconds.toString().padStart(2, "0")}`;
		}

		lineNames.forEach((lineName, index) => {
			node[lineName] = lines[index][key];
		});

		mappedData.push(node);
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const tickFormatter = useCallback((value: any, index: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}

		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}

		return value;
	}, []);

	return (
		<ResponsiveContainer>
			<LineChart data={mappedData}>
				<XAxis dataKey="x" />
				<YAxis tickFormatter={tickFormatter} />
				<Legend />
				{lineNames.map((lineName) => (
					<Line
						key={lineName}
						dot={false}
						isAnimationActive={false}
						// type="monotone"
						dataKey={lineName}
						name={lineName}
						stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
};

export default memo(Chart);
