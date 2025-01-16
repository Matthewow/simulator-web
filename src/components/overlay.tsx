import { Spinner } from "@fluentui/react-components";
import { useAppstore } from "../store";

const Overlay = () => {
	const dataStatus = useAppstore((state) => state.dataStatus);

	return dataStatus === "Loading" ? (
		<div
			style={{
				position: "absolute",
				width: "100%",
				height: "100%",
				background: "rgba(0,0,0,0.8)",
				zIndex: 3,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Spinner size="large" />
		</div>
	) : (
		<></>
	);
};

export default Overlay;
