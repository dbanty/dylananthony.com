module.exports = {
  mode: "jit",
  purge: ["./components/**/*.tsx", "./pages/**/*.tsx"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      colors: {
        "accent-1": "#FAFAFA",
        "accent-2": "#EAEAEA",
      },
      spacing: {
        28: "7rem",
      },
      boxShadow: {
        small: "0 5px 10px rgba(0, 0, 0, 0.12)",
        medium: "0 8px 30px rgba(0, 0, 0, 0.12)",
      },
    },
  },
};
