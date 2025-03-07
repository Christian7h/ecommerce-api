// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// import netlify from '@astrojs/netlify';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output:'server',

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['ecommerce-api-production-ef05.up.railway.app'],
    },
    esbuild: {
      // ESBuild options if needed
      logOverride: { 'this-is-error': 'silent' },
    },
  },
  
  integrations: [react()],
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0'
  },
  prefetch: {
    defaultStrategy: 'viewport'
  },
  env: {
    schema: {
      PUBLIC_API_URL: envField.string({ context: "client", access: "public", optional: true }),
    }
  },
  
});