import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import path from 'path' // Importar el módulo path
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  server: {
    port: parseInt(process.env.PORT) || 6001,
  },
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  }
})