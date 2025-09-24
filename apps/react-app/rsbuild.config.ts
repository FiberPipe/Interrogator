import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      // основное приложение
      index: "./src/index.tsx",
      // отдельный рендерер для окна выбора порта
      "port-picker": "./src/port-picker/index.tsx",
    },
  },

  html: {
    title: "Interrogator",
    tags: [
      {
        tag: "meta",
        attrs: {
          "http-equiv": "Content-Security-Policy",
          content: [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self' data:",
            "connect-src 'self' ws:",
          ].join("; "),
        },
      },
      {
        tag: "meta",
        attrs: {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
      },
    ],
  },

  output: {
    assetPrefix: "./",
    distPath: {
      root: "./build",
    },
  },

  server: {
    port: 3000,
    strictPort: true,
  },
});
