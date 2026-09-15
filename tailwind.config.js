/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vp: {
          bg: "#0d0f12",
          panel: "#15181d",
          border: "#262b33",
          accent: "#3b82f6",
          safe: "#22c55e",
          warning: "#f59e0b",
          violation: "#ef4444",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Consolas'", "monospace"],
      },
    },
  },
  plugins: [],
};
