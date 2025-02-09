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
        secondary: {
          DEFAULT: '#64748B',
          dark: '#334155',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1E293B',
        },
        'surface-light': {
          DEFAULT: '#F1F5F9',
          dark: '#475569',
        }
      },
    },
  },
  plugins: [],
}
