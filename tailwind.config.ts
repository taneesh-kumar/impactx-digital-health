import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: "#0a1f38",
          navydark: "#061527",
          navylight: "#163459",
          blue: "#0d5ca8",
          orange: "#d9531e",
          orangehover: "#c04412",
          graybg: "#f4f6f8",
          border: "#d3dbe3",
          textmain: "#1c2833",
          textmuted: "#566573",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
