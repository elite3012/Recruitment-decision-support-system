/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "neu-primary": "#0D9488", // Vibrant Teal
        "neu-secondary": "#E2E8F0", // Slightly darker slate-gray
        "neu-success": "#00A63D",
        "neu-warning": "#FE9900",
        "neu-danger": "#FF2157",
        "neu-surface": "#DDE1E4", // Darker surface for better neumorphism visibility
        "neu-text": "#1E2938",
      },
      fontFamily: {
        primary: ['"Space Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        neu: "12px 12px 24px #b8bcc0, -12px -12px 24px #ffffff",
        "neu-sm": "6px 6px 12px #b8bcc0, -6px -6px 12px #ffffff",
        "neu-inner":
          "inset 10px 10px 20px #b8bcc0, inset -10px -10px 20px #ffffff",
        "neu-inner-sm":
          "inset 4px 4px 8px #b8bcc0, inset -4px -4px 8px #ffffff",
        "neu-primary": "8px 8px 16px #0b7a70, -8px -8px 16px #0faea0",
        "neu-success": "8px 8px 16px #008531, -8px -8px 16px #00c749",
        "neu-warning": "8px 8px 16px #cb7a00, -8px -8px 16px #ffb800",
        "neu-danger": "8px 8px 16px #cc1a46, -8px -8px 16px #ff2868",
      },
    },
  },
  plugins: [],
};
