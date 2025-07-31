// client/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all React component files
  ],
  theme: {
    extend: {
      colors: {
        'fiverr-green': '#1dbf73', // Fiverr's primary green color
        'fiverr-dark': '#222325',   // Fiverr's dark background color
      }
    },
  },
  plugins: [],
}