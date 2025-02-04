import MapProvider from "./components/map";
import Overlay from "./components/overlay";
import Timeline from "./components/timeline";
import TopBar from "./components/top_bar";
import { useAppstore } from "./store";

const App = () => {
	const dataset = useAppstore((state) => state.dataset);
	return (
		<div className="flex h-100vh justify-center flex-col">
			<Overlay />
			<div className="flex flex-basis-[3rem] flex-grow-0 items-center z-2">
				<TopBar />
			</div>
			<div className="flex-1">
				<MapProvider dataset={dataset} key={JSON.stringify(dataset.idRouteMap)} />
			</div>
			<div className="flex-basis-[15rem]">
				<Timeline />
			</div>
		</div>
	);
};

export default App;
