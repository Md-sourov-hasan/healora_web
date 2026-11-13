
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = new URL(env.VITE_API_URL || 'https://healora-hub-backend-fqvj.onrender.com/api/v1')
  return {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Browser requests stay on the local origin; Vite forwards them to the real API.
    proxy: {
      '/api/v1': {
        target: backend.origin,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, backend.pathname.replace(/\/$/, '')),
      },
      '/health': {
        target: backend.origin,
        changeOrigin: true,
      },
    },
  },
  }
})

