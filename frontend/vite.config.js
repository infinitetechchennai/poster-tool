import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pollinations': {
        target: 'https://image.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pollinations/, ''),
        headers: {
          'User-Agent': 'PostCraft-Studio/1.0'
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Strip browser Origin and Referer so Cloudflare Turnstile does not block the request
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      },
      '/api/keywords': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/api/clusters': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/api/render': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/output_posters': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
