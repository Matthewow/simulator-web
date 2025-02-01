import { Spinner } from "@fluentui/react-components";
import { useAppstore } from "../store";

const Overlay = () => {
	const dataStatus = useAppstore((state) => state.dataStatus);

	return dataStatus === "Loading" ? (
		<div className="flex absolute w-full h-full bg-black bg-op-80 z-3 items-center justify-center">
			<Spinner size="large" />
		</div>
	) : (
		<></>
	);
};

export default Overlay;
