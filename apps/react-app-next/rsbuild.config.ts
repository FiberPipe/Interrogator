import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginSass } from '@rsbuild/plugin-sass';

// rsbuild.config.ts
export default defineConfig({
  plugins: [pluginReact(), pluginSass(), pluginSvgr({
    svgrOptions: {
      icon: true,
    },
  })],

  html: {
    title: "FiberPipe Interrogator",
    tags: [
      {
        tag: "meta",
        attrs: {
          "http-equiv": "Content-Security-Policy",
          content:
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'",
        },
      },
    ],
  },
  output: {
    assetPrefix: "./",
    distPath: {
      root: "./build",
    },
    copy: [
      {
        from: "src/shared/assets/tiles",
        to: "tiles", 
      },
    ]
  },
});
