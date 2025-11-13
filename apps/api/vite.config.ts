// apps/api/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: __dirname,
  build: {
    outDir: "../../dist/api",
    emptyOutDir: false,
    target: "node20",
    ssr: true,
    rollupOptions: {
      input: resolve(__dirname, "/index.ts"),
      output: {
        format: "es",
        entryFileNames: "index.mjs",
      },
      external: [
        "fs", "path", "url", "http", "https", "os", "crypto",
        "stream", "util", "events", "buffer", "querystring",
        "child_process", "zlib", "net", "tls", "dns", "punycode"
      ],
    },
    minify: false,
    sourcemap: true,
  },
  ssr: {
    noExternal: true,
  },
});