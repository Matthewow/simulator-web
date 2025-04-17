import { Spinner } from "@fluentui/react-components";

const Loading = () => {
	return (
		<div className="w-full h-full flex justify-center items-center">
			<Spinner size="large" />
		</div>
	);
};

export default Loading;
