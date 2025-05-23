import ReactDOM from "react-dom/client";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";

import "uno.css";

import App from "./app";

const rootEl = document.getElementById("root");

if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<FluentProvider theme={webDarkTheme}>
			<App />
		</FluentProvider>,
	);
}
