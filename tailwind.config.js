module.exports = {
    content: ["./templates/**/*.html"],
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