import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/konsta/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design System: Main Colors
        "green-02": "#4DE0A3",
        "light-sea-green": "#35CBC3",
        "green-tint": "#E6FAF2",
        "green-pale": "#F4FDF9",
        // Design System: Secondary Colors
        "brand-blue": "#0AA7FF",
        "brand-orange": "#FF7A00",
        "brand-black": "#1E242B",
        "brand-red": "#F0284A",
        // Design System: Dark & Neutrals
        "blue-gray": "#748DA6",
        "ford-blue": "#2C3968",
        "brand-gray": "#F3F3F3",
        // Semantic & Brand mappings
        brand: {
          50: "#F4FDF9",
          100: "#E6FAF2",
          200: "#C8F6E6",
          300: "#86ECC5",
          400: "#4DE0A3", // Green 02
          500: "#35CBC3", // Light Sea Green 01
          600: "#22B5AC",
          700: "#2C3968", // Ford Blue
          800: "#1E2950",
          900: "#131C38",
        },
      },
      backgroundImage: {
        "gradient-violet": "linear-gradient(135deg, #E0D9FF 0%, #D2CBF2 100%)",
        "gradient-orange-pink": "linear-gradient(135deg, #FED9DA 0%, #F7D0D2 100%)",
        "gradient-light-green": "linear-gradient(135deg, #E8F3E9 0%, #DFEFE1 100%)",
        "gradient-light-yellow": "linear-gradient(135deg, #FFF4E4 0%, #FFEACB 100%)",
        "gradient-brand": "linear-gradient(135deg, #4DE0A3 0%, #35CBC3 100%)",
      },
      fontFamily: {
        sans: ["'Averta'", "'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        averta: ["'Averta'", "'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
      },
      fontSize: {
        "h1": ["30px", { lineHeight: "38px", fontWeight: "700" }],
        "h2": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "h3": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-18": ["18px", { lineHeight: "26px" }],
        "body-16": ["16px", { lineHeight: "24px" }],
        "body-14": ["14px", { lineHeight: "20px" }],
        "body-12": ["12px", { lineHeight: "16px" }],
      },
    },
  },
  plugins: [],
};

export default config;



