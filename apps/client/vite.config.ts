// apps/client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  root: __dirname,
  server: {
    host: true,
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "../../dist/spa",
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "express",
        "mongodb",
        "serverless-http",
        "dotenv",
        "cors",
        "bcryptjs",
        "zod",
        "body-parser",
        "on-finished",
        "raw-body"
      ],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      "@shared": resolve(__dirname, "../../apps/shared"),
    },
  },
  optimizeDeps: {
    exclude: ["express", "mongodb", "serverless-http", "dotenv", "cors", "bcryptjs"],
  },
});
