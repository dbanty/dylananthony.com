/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  // TODO: Code block styles
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
