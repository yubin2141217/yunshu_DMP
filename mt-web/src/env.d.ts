/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_USE_MOCK: string
  readonly VITE_APP_TITLE: string
  readonly VITE_DEMO_USER: string
  readonly VITE_DEMO_PASS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
