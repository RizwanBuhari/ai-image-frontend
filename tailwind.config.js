// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // This 'content' array tells Tailwind CSS which files to scan for its utility classes.
  // It's crucial for Tailwind to generate the correct CSS.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans all JS, JSX, TS, TSX files in the 'src' directory
    "./public/index.html",       // Also scans your main HTML file
  ],
  theme: {
    extend: {
      // You can extend Tailwind's default theme here, e.g., add custom colors, fonts, etc.
      // For now, we'll keep it empty as our styles are directly applied.
    },
  },
  plugins: [], // You can add Tailwind plugins here if needed
}