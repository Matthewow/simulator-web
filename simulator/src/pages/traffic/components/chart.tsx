import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

interface ChartProps {
	data: Record<string, Record<string, number>>;
}
const Chart = (props: ChartProps) => {
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

		lineNames.forEach((lineName, index) => {
			node[lineName] = lines[index][key];
		});

		mappedData.push(node);
	}

	return (
		<ResponsiveContainer>
			<LineChart data={mappedData}>
				<XAxis dataKey="x" />
				<YAxis />
				<Legend />
				{lineNames.map((lineName) => (
					<Line
						key={lineName}
						type="monotone"
						dataKey={lineName}
						name={lineName}
						stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
					/>
				))}
			</LineChart>
		</ResponsiveContainer>
	);
};

export default Chart;
