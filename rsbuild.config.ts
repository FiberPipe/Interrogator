import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import path from 'node:path';

const isDev = process.env.NODE_ENV === 'development';

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
      js: isDev ? 'source-map' : false,
      css: false,
    },
    minify: {
      js: !isDev,
      css: !isDev,
    },
  },

  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
    removeConsole: !isDev ? ['log', 'warn'] : false,
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
          '**/node_modules/**',
        ],
      },
      optimization: {
        minimize: !isDev,
        usedExports: true,
        sideEffects: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
            },
            monaco: {
              test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
              name: 'monaco',
              priority: 20,
            },
            recharts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'recharts',
              priority: 20,
            },
          },
        },
      },
      externals: {
        electron: 'commonjs2 electron',
        serialport: 'commonjs2 serialport',
        'better-sqlite3': 'commonjs2 better-sqlite3',
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
