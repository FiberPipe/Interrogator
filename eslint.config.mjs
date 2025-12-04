import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

import noUntranslatedText from "./linter/no-untranslated-text.js";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    ignores: ["build/**", "dist/**", "node_modules/**", "deprecated/**", "linter/**"],

    languageOptions: {
      parser: tsParser,

      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: ["./tsconfig.base.json", "./tsconfig.electron.json"],
      },

      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      prettier: prettierPlugin,
      i18n: {
        rules: {
          "no-untranslated-text": noUntranslatedText,
        },
      },
    },

    rules: {
      "i18n/no-untranslated-text": "error",
      "prettier/prettier": ["error", { endOfLine: "auto" }],

      "no-console": "warn",
      "no-debugger": "error",
      "@typescript-eslint/no-unused-vars": "error",

      "import/order": [
        "error",
        {
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]],
          "newlines-between": "always",
        },
      ],

      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true },
      ],
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },

    settings: {
      react: { version: "detect" },
    },
  },
];
