import { Subtitle1 } from "@fluentui/react-components";
import { ArrowCircleLeftRegular } from "@fluentui/react-icons";
import { useContext } from "react";
import { DialogContext } from "../context";

const Title = () => {
	const { setDialog } = useContext(DialogContext);
	return (
		<div className="flex flex-row items-center">
			<ArrowCircleLeftRegular
				fontSize={24}
				className="mr-2"
				onClick={() => {
					setDialog("welcome");
				}}
			/>
			<Subtitle1>Create Project</Subtitle1>
		</div>
	);
};

export default Title;
