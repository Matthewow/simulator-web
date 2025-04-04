import ViewLayer from "@/lib/view_layer";
import { Checkbox } from "@fluentui/react-components";

const DataSelector = () => {
	return (
		<div>
			<Checkbox
				label={"Private Car"}
				defaultChecked={true}
				onChange={(_event, data) => {
					ViewLayer.instance.privateCars.visible = data.checked as boolean;
				}}
			/>
			<Checkbox
				label={"Bus"}
				defaultChecked={true}
				onChange={(_event, data) => {
					ViewLayer.instance.buses.visible = data.checked as boolean;
				}}
			/>
			<Checkbox
				label={"Taxi"}
				defaultChecked={true}
				onChange={(_event, data) => {
					ViewLayer.instance.taxis.visible = data.checked as boolean;
				}}
			/>
			<Checkbox
				label={"Subway"}
				defaultChecked={true}
				onChange={(_event, data) => {
					ViewLayer.instance.subway.visible = data.checked as boolean;
					ViewLayer.instance.paths.visible = data.checked as boolean;
					ViewLayer.instance.stations.visible = data.checked as boolean;
				}}
			/>
		</div>
	);
};

export default DataSelector;
