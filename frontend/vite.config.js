import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),vercel()],
  base: '/',

  server: {
    historyApiFallback: true,
    proxy:{
      "/api":{
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
})
