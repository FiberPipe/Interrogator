import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginSass } from '@rsbuild/plugin-sass';


export default defineConfig({
  plugins: [pluginReact(),pluginSass(), pluginSvgr({
    svgrOptions: {
      icon: true,
    },
  })],
});
