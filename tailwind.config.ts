import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Clean White & Blue Palette
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#badafe",
          300: "#7cbbfd",
          400: "#3796f9",
          500: "#1a73e8", // Primary Vibrant Blue
          600: "#0b57d0",
          700: "#071e49", // Deep Navy Blue
          800: "#061838",
          900: "#040e22",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
