import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" works on GitHub Pages subpaths AND on the mindcod.ing custom domain
export default defineConfig({
  plugins: [react()],
  base: "./",
});
