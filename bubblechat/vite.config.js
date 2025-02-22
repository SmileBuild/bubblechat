import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/v3/chat': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
