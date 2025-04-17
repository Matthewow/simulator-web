import { Spinner } from "@fluentui/react-components";

const Loading = () => {
	return (
		<div className="flex-1 flex justify-center items-center">
			<Spinner size="large" />
		</div>
	);
};

export default Loading;
