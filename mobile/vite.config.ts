import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { fileURLToPath, URL } from 'node:url'
import { offlineSingleHtmlPlugin } from './vite-plugins/offline-single-html.js'

export default defineConfig({
  base: './',
  server: {
    port: 3007,
    host: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: 512 * 1024,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'assets/index.js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  plugins: [
    vue(),
    offlineSingleHtmlPlugin(),
    // 已在 main.ts 全量引入 vant/lib/index.css，关闭按需样式，
    // 避免 Popup 样式后注入覆盖 Toast 深色背景（白底白字不可见）
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [VantResolver({ importStyle: false })],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [VantResolver({ importStyle: false })],
      dts: 'src/components.d.ts'
    })
  ]
})
