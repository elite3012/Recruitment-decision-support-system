/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          primary: '#006666',
          secondary: '#F1F2F5',
          success: '#00A63D',
          warning: '#FE9900',
          danger: '#FF2157',
          surface: '#E7E5E4',
          text: '#1E2938',
          neutral: '#E7E5E4',
        }
      },
      fontFamily: {
        primary: ['"Space Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neu': '8px 8px 16px #c4c3c2, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #c4c3c2, -4px -4px 8px #ffffff',
        'neu-inner': 'inset 8px 8px 16px #c4c3c2, inset -8px -8px 16px #ffffff',
        'neu-inner-sm': 'inset 4px 4px 8px #c4c3c2, inset -4px -4px 8px #ffffff',
      }
    },
  },
  plugins: [],
}
