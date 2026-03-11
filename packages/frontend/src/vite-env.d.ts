/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend service, e.g. https://your-app.railway.app */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
