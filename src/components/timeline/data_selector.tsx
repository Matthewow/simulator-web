import { Checkbox } from "@fluentui/react-components";

const DataSelector = () => {
	return (
		<div>
			<Checkbox label={"Private Car"} checked={true} />
			<Checkbox label={"Bus"} checked={true} />
			<Checkbox label={"Taxi"} checked={true} />
			<Checkbox label={"Train"} checked={true} />
		</div>
	);
};

export default DataSelector;
