import "./App.css";
import MapProvider from "./components/map";
import Overlay from "./components/overlay";
import TopBar from "./components/top_bar";

const App = () => {
	return (
		<div id="content">
			<Overlay />
			<TopBar />
			<MapProvider />
		</div>
	);
};

export default App;
