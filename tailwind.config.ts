import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4EEE3",
        "paper-sunk": "#EDE6D8",
        ink: "#1C1814",
        "ink-muted": "#6B6157",
        hairline: "#D8CDBB",
        "machine-bg": "#16130F",
        "machine-fg": "#F0E9DB",
        "machine-line": "#322B22",
        signal: "#E4502A",
        "signal-deep": "#B5341A",
        "cat-1": "#E4502A",
        "cat-2": "#2F5FD0",
        "cat-3": "#1F9E8A",
        "cat-4": "#C9A227",
        "cat-5": "#8B4A9C",
        "cat-6": "#5B6770",
      },
      fontFamily: {
        display: ['"Newsreader"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: {
        measure: "62ch",
      },
      letterSpacing: {
        label: "0.08em",
      },
    },
  },
  plugins: [],
} satisfies Config;
