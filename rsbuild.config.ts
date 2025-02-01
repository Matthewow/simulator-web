import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { UnoCSSRspackPlugin } from "@unocss/webpack/rspack";

export default defineConfig({
	plugins: [pluginReact()],
	html: { template: "./static/template.html" },
	tools: {
		rspack: {
			plugins: [UnoCSSRspackPlugin()],
		},
	},
});
