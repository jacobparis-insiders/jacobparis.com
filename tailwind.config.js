/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      screens: {
        print: { raw: "print" },
        screen: { raw: "screen" },
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontWeight: "bold",
            },
            a: {
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
          },
        },
      },
      animation: {
        appear: "appear 1s",
      },
      keyframes: {
        appear: {
          "0%, 99%": { height: "0", width: "0", opacity: "0" },
          "100%": { height: "auto", width: "auto", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}
