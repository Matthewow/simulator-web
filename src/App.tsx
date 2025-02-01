import MapProvider from "./components/map";
import Overlay from "./components/overlay";
import TopBar from "./components/top_bar";

const App = () => {
	return (
		<div className="flex h-100vh justify-center flex-col">
			<Overlay />
			<TopBar />
			<MapProvider />
		</div>
	);
};

export default App;
