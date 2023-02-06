module.exports = {
    content: ["./templates/**/*.html"],
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
    ],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        pre: null,
                        code: null,
                        'code::before': null,
                        'code::after': null,
                        'pre code': null,
                        'pre code::before': null,
                        'pre code::after': null
                    },
                },
            },
        }
    },
    variants: {},
    plugins: [
        require("@tailwindcss/typography")
    ]
};