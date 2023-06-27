import { defineConfig } from 'astro/config';

// https://astro.build/config
import vercel from "@astrojs/vercel/serverless";
// import vercel from "@astrojs/vercel/edge";

// https://astro.build/config
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: vercel(),
	integrations: [preact({
		compat: true
	})],
	build: {
		format: "directory"
	}
});