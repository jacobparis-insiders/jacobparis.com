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
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:first-of-type::after": { content: "none" },
          },
        },
      },
      animation: {
        appear: "appear 800ms",
        fade: "fade 300ms ease-out",
      },
      keyframes: {
        appear: {
          "0%, 99%": {
            height: "0",
            width: "0",
            opacity: "0",
          },
          "100%": {
            height: "auto",
            width: "auto",
            opacity: "1",
          },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
}
