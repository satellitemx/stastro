import preact from "@astrojs/preact";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from 'astro/config';

// https://astro.build/config
import vercel from "@astrojs/vercel/serverless";

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
    format: "directory"
  }
});