import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Deployed at cleanbooksconsulting.net/portal (not its own subdomain) — base and
// outDir keep every built asset path and the dev server itself under /portal too,
// matching the marketing site's Vercel rewrite that proxies /portal/* here.
// https://vite.dev/config/
export default defineConfig({
  base: '/portal/',
  plugins: [react()],
  build: {
    outDir: 'dist/portal',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
