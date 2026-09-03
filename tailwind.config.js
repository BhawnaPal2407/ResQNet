/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Core brand palette pulled from the ResQNet UI screens
        rq: {
          bg: "#0a0a0a",       // page background
          panel: "#131313",    // card / panel background
          border: "#262626",   // hairline borders
          red: "#e30613",      // primary brand red
          redDark: "#8f0009",  // deep red for gradients
          text: "#f5f5f5",     // primary text
          muted: "#9a9a9a",    // secondary text
        },
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(227, 6, 19, 0.35)",
      },
    },
  },
  plugins: [],
}
