/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THEME?: 'elsa' | 'ultraman' | 'pawpatrol'
  readonly VITE_APP_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
