import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'electron/main.js',
    })
  ],
  server: {
    port: 5173,
    open: true
  },
  base: process.env.ELECTRON_RENDERER_URL ? './' : '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
