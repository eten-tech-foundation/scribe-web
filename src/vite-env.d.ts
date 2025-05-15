/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly API_URL: string;
  readonly ENVIRONMENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 
