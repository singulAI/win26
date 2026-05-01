import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "."),
  build: {
    outDir: "dist-metrics",
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "metrics.html"),
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    {
      name: "rename-metrics-html",
      closeBundle() {
        const distDir = path.resolve(__dirname, "dist-metrics");
        const metricsHtml = path.join(distDir, "metrics.html");
        const indexHtml = path.join(distDir, "index.html");

        if (fs.existsSync(metricsHtml)) {
          fs.renameSync(metricsHtml, indexHtml);
        }
      },
    },
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
