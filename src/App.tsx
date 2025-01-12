import "./App.css";
import MapProvider from "./features/map";
import TopBar from "./features/ui/top_bar";

const App = () => {
	return (
		<div id="content">
			<TopBar />
			<MapProvider />
		</div>
	);
};

export default App;
