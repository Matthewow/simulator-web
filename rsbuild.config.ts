import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { UnoCSSRspackPlugin } from "@unocss/webpack/rspack";

export default defineConfig({
	dev: {
		hmr: false,
	},
	plugins: [pluginReact()],
	html: { template: "./static/template.html" },
	tools: {
		rspack: {
			plugins: [UnoCSSRspackPlugin()],
		},
	},
	resolve: {
		alias: {
			"@": "./src/",
			"@lib": "./src/lib",
		},
	},
});
