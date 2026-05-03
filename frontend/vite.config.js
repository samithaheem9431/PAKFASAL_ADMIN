import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase")) return "firebase";
          if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          if (id.includes("react-router")) return "router";
        },
      },
    },
    // Spline runtime chunks are large but load only on login (lazy).
    chunkSizeWarningLimit: 2200,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
