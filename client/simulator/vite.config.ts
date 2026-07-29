import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(),  tailwindcss(),],
  build: {
    outDir: resolve(__dirname, '../../src/templates/simulator'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Mirror tsconfig.app.json's `@protocol/*` path so Rollup resolves the
      // shared protocol module (e.g. the value import of `parseExtensionMessage`
      // from `@protocol/messages`) in production builds — tsc resolves it via
      // `paths`, but Vite needs its own alias.
      "@protocol": path.resolve(__dirname, "../../src/protocol"),
    },
  },
  base: './',
})
