/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        intune: {
          blue: '#0078D4',
          blueHover: '#106EBE',
          blueLight: '#2B88D8',
          darkBg: '#0b0f19',
          darkCard: '#111827',
          darkBorder: '#1f2937',
          darkHover: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'intune': '0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'intune-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
