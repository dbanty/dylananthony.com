/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
  safelist: [
    // Zinc tags
    "bg-zinc-200",
    "hover:bg-zinc-300",
    "dark:bg-zinc-700",
    "dark:hover:bg-zinc-600",
    // Orange tags
    "bg-orange-200",
    "hover:bg-orange-300",
    "dark:bg-orange-700",
    "dark:hover:bg-orange-600",
    // Fuchsia tags
    "bg-fuchsia-200",
    "hover:bg-fuchsia-300",
    "dark:bg-fuchsia-700",
    "dark:hover:bg-fuchsia-600",
    // Teal tags
    "bg-teal-200",
    "hover:bg-teal-300",
    "dark:bg-teal-700",
    "dark:hover:bg-teal-600",
    // Indigo tags
    "bg-indigo-200",
    "hover:bg-indigo-300",
    "dark:bg-indigo-700",
    "dark:hover:bg-indigo-600",
    // Purple tags
    "bg-purple-200",
    "hover:bg-purple-300",
    "dark:bg-purple-700",
    "dark:hover:bg-purple-600",
    // Blue tags
    "bg-blue-200",
    "hover:bg-blue-300",
    "dark:bg-blue-700",
    "dark:hover:bg-blue-600",
    // Green tags
    "bg-green-200",
    "hover:bg-green-300",
    "dark:bg-green-700",
    "dark:hover:bg-green-600",
    // Rose
    "bg-rose-200",
    "hover:bg-rose-300",
    "dark:bg-rose-700",
    "dark:hover:bg-rose-600",
    // Amber
    "bg-amber-200",
    "hover:bg-amber-300",
    "dark:bg-amber-700",
    "dark:hover:bg-amber-600",
    // Red
    "bg-red-200",
    "hover:bg-red-300",
    "dark:bg-red-700",
    "dark:hover:bg-red-600",
    //Cyan
    "bg-cyan-200",
    "hover:bg-cyan-300",
    "dark:bg-cyan-700",
    "dark:hover:bg-cyan-600",
  ],
};
