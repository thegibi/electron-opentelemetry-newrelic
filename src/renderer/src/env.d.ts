/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_SOME_KEY: string
  readonly VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: string
  readonly VITE_OTEL_EXPORTER_OTLP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
