import MapProvider from "./components/map";
import Overlay from "./components/overlay";
import TopBar from "./components/top_bar";

const App = () => {
	return (
		<div className="flex h-100vh justify-center flex-col">
			<Overlay />
			<div className="flex flex-basis-[3rem] flex-grow-0 items-center z-2">
				<TopBar />
			</div>
			<div className="flex-1">
				<MapProvider />
			</div>
		</div>
	);
};

export default App;
