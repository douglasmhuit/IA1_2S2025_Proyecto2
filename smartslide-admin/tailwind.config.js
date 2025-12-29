/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        'smartslide-blue': '#2563eb',
        'smartslide-green': '#10b981',
        'smartslide-orange': '#f59e0b',
      }
    },
  },
  plugins: [],
}