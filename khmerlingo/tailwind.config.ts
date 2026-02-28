import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        khmer: ["'Noto Sans Khmer'", "sans-serif"],
        sans: ["'Noto Sans Khmer'", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Duolingo palette
        "duo-green": "#58CC02",
        "duo-green-dark": "#46A302",
        "duo-green-light": "#89E219",
        "duo-blue": "#1CB0F6",
        "duo-blue-dark": "#0A91D2",
        "duo-blue-light": "#7DD9FB",
        "duo-red": "#E53838",
        "duo-red-dark": "#C42020",
        "duo-red-light": "#FF6B6B",
        "duo-yellow": "#FAA918",
        "duo-yellow-dark": "#D4880A",
        "duo-yellow-light": "#FFC94D",
        "duo-purple": "#8549BA",
        "duo-purple-dark": "#6933A0",
        "duo-purple-light": "#A97DD9",
        "duo-orange": "#FF9600",
        "duo-gray": "#AFAFAF",
        "duo-gray-light": "#E5E5E5",
        "duo-gray-dark": "#777777",
        // Khmer cultural colors
        "khmer-red": "#C0392B",
        "khmer-red-dark": "#922B21",
        "khmer-red-light": "#E74C3C",
        "khmer-blue": "#1A5276",
        "khmer-blue-dark": "#154360",
        "khmer-blue-light": "#2E86C1",
        "khmer-gold": "#D4AC0D",
        "khmer-gold-dark": "#B7950B",
        "khmer-gold-light": "#F1C40F",
        // UI
        background: "#FFFFFF",
        surface: "#F7F7F7",
        border: "#E5E5E5",
        muted: "#AFAFAF",
        foreground: "#3C3C3C",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        "duo": "0 4px 0 0 rgba(0,0,0,0.2)",
        "duo-green": "0 4px 0 0 #46A302",
        "duo-blue": "0 4px 0 0 #0A91D2",
        "duo-red": "0 4px 0 0 #C42020",
        "duo-yellow": "0 4px 0 0 #D4880A",
        "duo-purple": "0 4px 0 0 #6933A0",
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.12)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.1)", opacity: "1" },
          "80%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        "heart-break": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.3) rotate(-5deg)" },
          "60%": { transform: "scale(0.8) rotate(5deg)" },
          "100%": { transform: "scale(1) rotate(0)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.4s ease-in-out",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        shake: "shake 0.4s ease-in-out",
        pop: "pop 0.3s ease-in-out",
        "heart-break": "heart-break 0.4s ease-in-out",
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
