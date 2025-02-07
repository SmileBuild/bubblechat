/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#1E293B',
        background: '#0F172A',
        surface: '#1E293B',
        'surface-light': '#334155',
      },
    },
  },
  plugins: [],
}
