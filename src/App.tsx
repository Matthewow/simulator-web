import MapProvider from "./components/map";
import Overlay from "./components/overlay";
import Timeline from "./components/timeline";
import TopBar from "./components/top_bar";
import { useAppstore } from "./store";
import "./lib/railway";

const App = () => {
	const dataStatus = useAppstore((state) => state.dataStatus);
	return (
		<div className="flex h-100vh justify-center flex-col">
			<Overlay />
			<div className="flex flex-basis-[3rem] flex-grow-0 items-center z-2">
				<TopBar />
			</div>
			<div className="flex-1">
				<MapProvider />
			</div>
			{dataStatus === "Ready" && (
				<div className="flex-basis-[12rem]">
					<Timeline />
				</div>
			)}
		</div>
	);
};

export default App;
