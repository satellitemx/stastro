import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from 'astro/config';
// import vercel from "@astrojs/vercel/edge";

import preact from "@astrojs/preact";

// https://astro.build/config
import svelte from "@astrojs/svelte";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [preact({
    compat: true
  }), svelte({
    compilerOptions: {
      customElement: true
    }
  }), tailwind()],
  build: {
    format: "directory",
		excludeMiddleware: true,
  }
});