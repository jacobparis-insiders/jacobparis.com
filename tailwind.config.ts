import { type Config } from "tailwindcss"

import animatePlugin from "tailwindcss-animate"
import typographyPlugin from "@tailwindcss/typography"

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
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
    },
    extend: {
      colors: {
        "neutral": {
          500: '#757575'
        }
      },
      boxShadow: {
        smooth: 'rgba(0, 0, 0, 0.05) 0px 4px 44px',
      },
      screens: {
        print: {raw: 'print'},
        screen: {raw: 'screen'},
      },
      animation: {
        appear: "appear 800ms",
        disappear: "disappear 800ms forwards",
        fade: "fade 300ms ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
        disappear: {
          "0%, 99%": {
            height: "auto",
            width: "auto",
            opacity: "1",
          },
          "100%": {
            height: "0",
            width: "0",
            opacity: "0",
          },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [animatePlugin, typographyPlugin],
} satisfies Config
