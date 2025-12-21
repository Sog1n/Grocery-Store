import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173, // (hoặc 5174 bên admin)
    watch: {
      usePolling: true,
    },
  },
  // Thêm đoạn này
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // File cài đặt môi trường
    css: true,
  },
})