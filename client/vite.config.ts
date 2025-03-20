import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(),  tailwindcss(),],
  build: {
    outDir: resolve(__dirname, '../src/templates/panelView'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: './',
})
