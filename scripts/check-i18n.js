#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/* ================= CONFIG ================= */

const I18N_DIR = 'src/i18n';
const CODE_DIR = 'src';

const I18N_EXT = '.json';
const CODE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];

const TRANSLATION_REGEX = /\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

/* ========================================== */

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : fullPath;
  });
}

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object'
      ? flattenKeys(value, fullKey)
      : fullKey;
  });
}

/* ============ 1. COLLECT I18N KEYS ============ */

const localeFiles = fs
  .readdirSync(I18N_DIR)
  .filter((f) => f.endsWith(I18N_EXT));

const localeKeyMap = {};
const allLocaleKeys = new Set();

for (const file of localeFiles) {
  const locale = path.basename(file, I18N_EXT);
  const json = readJson(path.join(I18N_DIR, file));
  const keys = flattenKeys(json);

  localeKeyMap[locale] = new Set(keys);
  keys.forEach((k) => allLocaleKeys.add(k));
}

/* ============ 2. COLLECT USED KEYS ============ */

const usedKeys = new Set();

walk(CODE_DIR)
  .filter((f) => CODE_EXTS.includes(path.extname(f)))
  .forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = TRANSLATION_REGEX.exec(content))) {
      usedKeys.add(match[1]);
    }
  });

/* ============ 3. ANALYSIS ============ */

const unusedKeys = [...allLocaleKeys].filter((k) => !usedKeys.has(k));
const missingKeys = [...usedKeys].filter((k) => !allLocaleKeys.has(k));

/* ============ 4. LOCALE COMPARISON ============ */

const baseLocale = localeFiles[0].replace(I18N_EXT, '');
const baseKeys = localeKeyMap[baseLocale];

const localeDiffs = {};

for (const [locale, keys] of Object.entries(localeKeyMap)) {
  if (locale === baseLocale) continue;

  const missing = [...baseKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !baseKeys.has(k));

  if (missing.length || extra.length) {
    localeDiffs[locale] = { missing, extra };
  }
}

/* ============ 5. REPORT ============ */

console.log('\n📦 i18n CHECK REPORT\n');

if (unusedKeys.length) {
  console.log('❌ Unused keys (can be removed):');
  unusedKeys.forEach((k) => console.log('  -', k));
} else {
  console.log('✅ No unused keys');
}

console.log();

if (missingKeys.length) {
  console.log('❌ Missing keys (used in code but not in i18n):');
  missingKeys.forEach((k) => console.log('  -', k));
} else {
  console.log('✅ No missing keys');
}

console.log();

if (Object.keys(localeDiffs).length) {
  console.log('⚠️ Locale mismatches:');
  for (const [locale, diff] of Object.entries(localeDiffs)) {
    console.log(`\n🌍 ${locale}:`);
    if (diff.missing.length) {
      console.log('  Missing:');
      diff.missing.forEach((k) => console.log('   -', k));
    }
    if (diff.extra.length) {
      console.log('  Extra:');
      diff.extra.forEach((k) => console.log('   -', k));
    }
  }
} else {
  console.log('✅ All locales have identical key sets');
}

console.log('\n✔ Done\n');
