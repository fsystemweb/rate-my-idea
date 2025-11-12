import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    outDir: 'dist/api',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, '/apps/api/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    target: 'node20',
    ssr: true,
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        'fs', 'path', 'url', 'http', 'https', 'os', 'crypto',
        'stream', 'util', 'events', 'buffer', 'querystring',
        'child_process', 'zlib', 'net', 'tls', 'dns', 'punycode',
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
        dir: 'dist/api'
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/client'),
      '@shared': path.resolve(__dirname, './apps/shared'),
    },
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})