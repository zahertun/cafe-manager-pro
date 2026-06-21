/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f5',
          100: '#fbeee6',
          500: '#8b5a2b',
          600: '#6f4822',
          700: '#54361a',
          800: '#3a2512',
          900: '#23160a',
        }
      }
    },
  },
  plugins: [],
}
