import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // 起動時にブラウザを自動で開く
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 本番環境ではソースマップを無効化して軽量化
    chunkSizeWarningLimit: 1000,
  }
})
