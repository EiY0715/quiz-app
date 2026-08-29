/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
        accent: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
keyframes: {
  fadeIn: {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
},
animation: {
  fadeIn: 'fadeIn 0.5s ease-out',
},
