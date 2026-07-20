import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://vivekally.github.io/inside-an-llm/
export default defineConfig({
  base: "/inside-an-llm/",
  plugins: [react()],
  build: {
    target: "es2020",
    assetsInlineLimit: 2048,
  },
});
