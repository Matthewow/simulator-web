import TrafficPage from "./pages/traffic";
import WelcomePage from "./pages/welcome";
import { useAppstore } from "./store";

const App = () => {
	const page = useAppstore((state) => state.page);

	switch (page) {
		case "welcome": {
			return <WelcomePage />;
		}
		case "traffic": {
			return <TrafficPage />;
		}
		default:
			<div>Error</div>;
	}
};

export default App;
