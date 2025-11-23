/** @type {import('tailwindcss').Config} */
export default {
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
      },
      fontFamily: {
        // Use your custom font as the default sans font
        sans: ['Euclid Circular A', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}