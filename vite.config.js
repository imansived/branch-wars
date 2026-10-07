import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this app from a /branch-wars/ subpath; Vercel serves
// it from the domain root. A single fixed base can only be right for one of
// them — Vercel sets VERCEL=1 automatically during its own build, so branch
// on that instead of hand-toggling this file per deploy target.
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? "/" : "/branch-wars/",
});


