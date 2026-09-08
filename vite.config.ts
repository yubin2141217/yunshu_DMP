import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

/** AI Studio / 根目录启动：以运营端 mt-web 为应用根 */
const mtRoot = fileURLToPath(new URL('./mt-web', import.meta.url))

export default defineConfig({
  root: mtRoot,
  envDir: mtRoot,
  publicDir: path.join(mtRoot, 'public'),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.join(mtRoot, 'src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
})
