import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Relative base so the same build works at / and under /horo/ on GitHub Pages.
export default defineConfig({ base: "./", plugins: [react(), tailwindcss()] });
