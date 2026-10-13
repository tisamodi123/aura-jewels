import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: "#013D3D",
        "brand-hover": "#002d2d",
      },
      fontFamily: {
        'sans': ['var(--font-instrument-sans)', 'sans-serif'],
        'el-messiri': ['var(--font-el-messiri)', 'sans-serif'],
        'dm-sans': ['var(--font-dm-sans)', 'sans-serif'],
        'jakarta': ["var(--font-plus-jakarta-sans)", "'Plus Jakarta Sans'", 'Inter', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
        'cormorant-garamond': ['var(--font-cormorant-garamond)', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        'instrument-sans': ['var(--font-instrument-sans)', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      }
    },
  },
  plugins: [],
};
export default config;
