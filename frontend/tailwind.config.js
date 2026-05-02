import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Nastaliq Urdu", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
          900: "#064e3b",
        },
      },
      backgroundImage: {
        "admin-shell":
          "linear-gradient(135deg, rgb(236 253 245 / 0.95) 0%, rgb(240 253 250 / 0.9) 45%, rgb(241 245 249 / 0.85) 100%)",
        "auth-hero":
          "linear-gradient(125deg, #d8f3dc 0%, #b7e4c7 25%, #95d5b2 50%, #74c69d 75%, #52b788 100%)",
        "btn-admin":
          "linear-gradient(90deg, #047857 0%, #059669 45%, #10b981 100%)",
      },
      keyframes: {
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(28px, -36px) scale(1.06)" },
          "66%": { transform: "translate(-22px, 22px) scale(0.96)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        blob: "blob 9s ease-in-out infinite",
        "blob-slow": "blob 14s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
      },
      animationDelay: {
        1000: "1s",
        2000: "2s",
        3000: "3s",
      },
    },
  },
  plugins: [typography],
};
