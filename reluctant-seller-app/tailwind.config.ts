import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        'brand-gold': '#B8963E',
        'brand-navy': '#1B2A4A',
      }
    },
  },
  plugins: [],
};
export default config;
