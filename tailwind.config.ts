import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        filmforge: {
          dark: "#1C0F09",
          charcoal: '#1C0F09',
          silver: '#1C0F09',
          accent: '#1C0F09',
          purple: '#1C0F09',
          'deep-purple': '#1C0F09',
          divider: "#1C0F09",
          'btn-bg': '#1C0F09',
          // Canvas/Generate page colors
          background: '#FFFFFE',
          text: '#1C0F09',
          'text-muted': '#1C0F09',
          'border-light': 'rgba(57, 48, 44, 0.5)',
          'input-bg': '#FFFFFE',
          'border': 'rgba(57, 48, 44, 0.5)',
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        foreground: "hsl(var(--foreground))",
        background: "hsl(var(--background))",
        black: "#1C0F09",
      },
      fontFamily: {
        'sans': ['Jost', 'system-ui', 'sans-serif'],
        'jost': ['Jost', 'system-ui', 'sans-serif'],
        'futura': ['Futura PT', 'Futura', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderWidth: {
        '0.5': '0.125px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
