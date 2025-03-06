// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output:'server',

  vite: {
    plugins: [tailwindcss()]
  },
  env: {
    schema: {
      // Variables públicas (accesibles desde el cliente)
      PUBLIC_API_URL: {
        type: 'string',
        context: 'client',
        access: 'public'
      },
    }
  },

  integrations: [react()],
  adapter: netlify()
});