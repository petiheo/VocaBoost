import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "react-select",
            "react-toastify",
            "react-modal",
            "react-loading-skeleton",
          ],
          api: ["axios", "jwt-decode"],
          utils: ["date-fns"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
