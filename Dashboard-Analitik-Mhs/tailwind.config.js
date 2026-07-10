/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        secondary: "#9CCDDB",
        accent1: "#5790AB",
        accent2: "#06446B",
        background: "#F8FAFC", // subtle gray background for whitespace to pop
        text: {
          main: "#1E293B",
          muted: "#64748B"
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
