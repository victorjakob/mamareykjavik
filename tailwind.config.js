/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        aegean: ['"TAN Aegean"', "sans-serif"], // Define the font family
      },
      colors: {
        background: "hsl(var(--background))",
        backgroundlight: "hsl(var(--backgroundlight))",
        foreground: "hsl(var(--foreground))",
        "color-white": "hsl(var(--color-white))",
        "color-whitecream": "hsl(var(--color-whitecream))",
        "color-black": "hsl(var(--color-black))",
        "primary-green": "hsl(var(--color-primary-green))",
      },
    },
  },
  plugins: [],
};
