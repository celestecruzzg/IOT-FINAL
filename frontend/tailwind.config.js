/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3E90FF',
        secondary: '#1155b4',
        light: '#E2EEFF',
      },
    },
  },
  plugins: [],
  important: true,
} 