import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Uncomment below to proxy API calls through the local Express server (avoids CORS)
    // proxy: {
    //   '/reddit-api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/reddit-api/, ''),
    //   },
    // },
  },
})
