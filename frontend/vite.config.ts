import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/antd/") || id.includes("\\antd\\") || id.includes("@ant-design") || id.includes("/rc-") || id.includes("\\rc-")) {
            return "vendor-antd";
          }
          if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/") || id.includes("\\react\\")) {
            return "vendor-react";
          }
          if (id.includes("@tanstack")) {
            return "vendor-query";
          }
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("/zod/") || id.includes("zustand") || id.includes("immer") || id.includes("axios")) {
            return "vendor-form";
          }
          return "vendor-misc";
        },
      },
    },
  },
});