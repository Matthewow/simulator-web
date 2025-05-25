import { useAppstore } from "@/store";
import { Spinner, ProgressBar } from "@fluentui/react-components";

const Loading = () => {
	const progress = useAppstore((state) => state.progress);

	return (
		<div className="flex-1 flex justify-center items-center">
			{progress !== -1 ? (
				<ProgressBar value={progress / 100} thickness="large" shape="rounded" />
			) : (
				<Spinner size="large" />
			)}
		</div>
	);
};

export default Loading;
