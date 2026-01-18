# Linter & Prettier Setup

Этот документ описывает настройку ESLint и Prettier в проекте `@interrogator/app`, а также примеры использования.

---

## 1. Установка зависимостей

```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react \
  eslint-plugin-react-hooks eslint-plugin-import
```

---

## 2. ESLint конфигурация (`.eslintrc.js`)

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: { browser: true, es2021: true, node: true },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-console': 'warn',
    'no-debugger': 'error',
    '@typescript-eslint/no-unused-vars': ['error'],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
  },
  settings: { react: { version: 'detect' } },
};
```

---

## 3. Prettier конфигурация (`.prettierrc`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

---

## 4. Скрипты в `package.json`

```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{ts,tsx,js,jsx}' 'electron/**/*.{ts,js}'",
    "lint:fix": "eslint 'src/**/*.{ts,tsx,js,jsx}' 'electron/**/*.{ts,js}' --fix",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,js,jsx,json,css,md}' 'electron/**/*.{ts,js,json,css,md}'",
    "format:fix": "prettier --write 'src/**/*.{ts,tsx,js,jsx,json,css,md}' 'electron/**/*.{ts,js,json,css,md}'",
    "ci:lint": "npm run lint",
    "ci:format": "npm run format:check"
  }
}
```

---

## 5. Примеры использования

### 5.1 Проверка линтера

```bash
npm run lint
```

### 5.2 Исправление ошибок линтера автоматически

```bash
npm run lint:fix
```

### 5.3 Проверка Prettier (без исправления)

```bash
npm run format:check
```

### 5.4 Автоматическое форматирование Prettier

```bash
npm run format:fix
```

### 5.5 CI команды

```bash
npm run ci:lint      # ESLint проверка
npm run ci:format    # Prettier проверка
```

---

> Все команды охватывают как React код (`src/`), так и Electron код (`electron/`).
