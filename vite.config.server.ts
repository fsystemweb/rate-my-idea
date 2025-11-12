// vite.config.server.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    outDir: 'dist/server',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'server/node-build.ts'), // your Express app
      formats: ['es'],
      fileName: () => 'node-build.mjs', // Vercel expects .mjs for ESM
    },
    target: 'node20',
    ssr: true,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        // Node.js built-ins (never bundle)
        'fs', 'path', 'url', 'http', 'https', 'os', 'crypto',
        'stream', 'util', 'events', 'buffer', 'querystring',
        'child_process', 'zlib', 'net', 'tls', 'dns', 'punycode',

        // Your runtime dependencies (installed on Vercel)
        'express',
        'cors',
        'serverless-http',
        'mongodb',
        'bcryptjs',
        'zod',
        'dotenv',
      ],
      output: {
        format: 'es',
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name]-[hash].mjs',
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})