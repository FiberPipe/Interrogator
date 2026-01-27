import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import path from 'node:path';

export default defineConfig({
  plugins: [pluginReact(), pluginNodePolyfill()],

  source: {
    entry: {
      index: './src/app/index.tsx',
    },
  },

  html: {
    title: 'Interrogator',
    tags: [
      {
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self'",
          ].join('; '),
        },
      },
      {
        tag: 'meta',
        attrs: {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      },
    ],
  },

  output: {
    assetPrefix: './',
    distPath: {
      root: './build/renderer',
    },
    sourceMap: {
      js: 'source-map',
    },
  },

  tools: {
    rspack: {
      output: {
        publicPath: './',
      },
      watchOptions: {
        ignored: [
          path.resolve(__dirname, 'logs'),
          '**/logs/**',
        ],
      },
    },
    postcss: {
      postcssOptions: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
  },

  server: {
    port: 3000,
    strictPort: true,
  },
});
