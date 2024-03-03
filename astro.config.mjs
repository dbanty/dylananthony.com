import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://next.dylananthony.com",  // TODO: Point at primary domain
  integrations: [mdx(), sitemap(), tailwind({applyBaseStyles: false,})],
  redirects: {
    "/": "/blog",
  },
  markdown: {
    syntaxHighlight: "prism"
  }
});
