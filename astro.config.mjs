import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://dylananthony.com",
  integrations: [mdx(), sitemap()],
  redirects: {
    "/": "/blog",
  },
  markdown: {
    syntaxHighlight: "prism",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
