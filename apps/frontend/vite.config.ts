import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// When deploying to GitHub Pages, set VITE_BASE_PATH to /your-repo-name/
// e.g. VITE_BASE_PATH=/docufree/
// For Vercel or custom domain, leave it unset (defaults to /)
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
