// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output:'server',

  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [react()],
  adapter: netlify(),
  prefetch: {
    defaultStrategy: 'viewport'
  },
  env: {
    schema: {
      PUBLIC_API_URL: envField.string({ context: "client", access: "public", optional: true }),
    }
  }
});