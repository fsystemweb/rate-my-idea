// apps/api/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "../../.vercel/output/functions", // Vercel reads this
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "/index.ts"), // /api → index.mjs
      },
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
      // Only external Node.js built-ins
      external: [
        "fs", "path", "url", "http", "https", "os", "crypto",
        "stream", "util", "events", "buffer", "querystring",
        "child_process", "zlib", "net", "tls", "dns", "punycode"
      ],
    },
    target: "node20",
    minify: false,
    sourcemap: true,
  },
  ssr: { noExternal: true },
});