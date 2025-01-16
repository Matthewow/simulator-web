import "./App.css";
import MapProvider from "./components/map";
import TopBar from "./components/top_bar";

const App = () => {
	return (
		<div id="content">
			<TopBar />
			<MapProvider />
		</div>
	);
};

export default App;
