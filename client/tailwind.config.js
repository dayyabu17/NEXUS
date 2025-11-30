/** @type {import('tailwindcss').Config} */
import scrollbar from 'tailwind-scrollbar';
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nexus-primary': '#1A73E8', 
        'nexus-accent': '#FFD700', 
        'nexus-dark': '#000000',   
        'nexus-light': '#FFFFFF',
        accent: {
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
        },
      },
      fontFamily: {
        // Use your custom font as the default sans font
        sans: ['Euclid Circular A', 'sans-serif'], 
      },
    },
  },
  plugins: [
    scrollbar,
  ],
}