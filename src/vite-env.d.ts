/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ORG: string;
  readonly VITE_SENTRY_PROJECT: string;
  readonly VITE_STATION_ID: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  readonly VITE_INACTIVITY_TIMEOUT_MS: string;
  readonly VITE_FALLBACK_BOUNTY1_URL: string;
  readonly VITE_FALLBACK_BOUNTY2_URL: string;
  readonly VITE_FALLBACK_BOUNTY3_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
