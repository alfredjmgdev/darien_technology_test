/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4F46E5", // indigo-600
          dark: "#6366F1", // indigo-500
        },
        background: {
          light: "#F9FAFB", // gray-50
          dark: "#111827", // gray-900
        },
        text: {
          light: "#1F2937", // gray-800
          dark: "#F9FAFB", // gray-50
        },
        input: {
          light: "#FFFFFF", // white
          dark: "#374151", // gray-700
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
