/// <reference types="astro/client" />
interface ImportMetaEnv {
    readonly API_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
// src/env.ts
export const AUTH_URL = import.meta.env.PUBLIC_AUTH_URL; // Usa `PUBLIC_` para exponerlas en el frontend
export const API_URL = import.meta.env.PUBLIC_API_URL; 
