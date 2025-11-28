// apps/client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path, { resolve } from "path";

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
  envDir: path.resolve(__dirname, "../../"),
  build: {
    outDir: "../../dist/client",
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
        "raw-body",
      ],
    },
  },
  plugins: [react()],
  publicDir: path.resolve(__dirname, "../../public"),
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  optimizeDeps: {
    exclude: [
      "express",
      "mongodb",
      "serverless-http",
      "dotenv",
      "cors",
      "bcryptjs",
    ],
  },
});
