import ReactDOM from "react-dom/client";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";

import App from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<FluentProvider theme={webDarkTheme}>
			<App />
		</FluentProvider>,
	);
}
