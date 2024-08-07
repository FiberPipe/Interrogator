import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  html: {
    title: 'Electron ESM Template',
    tags: [
      {
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
        },
      },
    ],
  },
  output: {
    // Required especially for Electron as it's using the file:// protocol without a domain.
    assetPrefix: './',
    distPath:{
      root: './build'
    }
  },
})
