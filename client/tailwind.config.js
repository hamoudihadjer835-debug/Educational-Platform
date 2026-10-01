/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#01427a',    // Regal Blue - Primary brand color
        secondary: '#6dcffb',  // Malibu - Secondary brand color
        accent: '#e14177',     // Cerise Red - For highlights and calls to action
        danger: '#e14177',     // Cerise Red - For errors and warnings
        warning: '#e14177',    // Cerise Red - For cautions and alerts
        info: '#6dcffb',       // Malibu - For informational elements
        success: '#01427a',    // Using primary color for success messages
        dark: '#0c0c0d',       // Woodsmoke - For text and headers
        light: '#ffffff',      // White - For light backgrounds
        cream: '#ffffff',      // White - For cards and sections
        neutral: '#0c0c0d',    // Woodsmoke - For secondary text (with opacity)
        muted: '#0c0c0d',      // Woodsmoke - For muted text (with opacity)
        surface: '#ffffff',    // White - For card surfaces
        border: '#6dcffb',     // Malibu - For borders (with opacity)
      },
    },
  },
  plugins: [],
}
