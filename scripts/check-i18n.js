#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src/shared/i18n/locales');
const CODE_DIR = path.join(ROOT, 'src');

const BASE_LOCALE = 'en';
const FAIL_ON_UNUSED = process.argv.includes('--fail-unused');

let totalMissingLocaleKeys = 0;
let totalExtraLocaleKeys = 0;

/* -------------------------------- utils -------------------------------- */
function die(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

// Рекурсивно собираем ключи с namespace
function collectKeys(obj, prefix, out) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      collectKeys(value, fullKey, out);
    } else {
      out.set(fullKey, prefix); // сохраняем namespace/файл
    }
  }
}

/* ------------------------------ load locales ----------------------------- */
if (!fs.existsSync(LOCALES_DIR)) {
  die(`Locales directory not found: ${LOCALES_DIR}`);
}

const locales = fs
  .readdirSync(LOCALES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (!locales.includes(BASE_LOCALE)) {
  die(`Base locale "${BASE_LOCALE}" not found. Found: ${locales.join(', ')}`);
}

info(`Found locales: ${locales.join(', ')}`);
info(`Base locale: ${BASE_LOCALE}`);

function loadLocaleKeys(locale) {
  const dir = path.join(LOCALES_DIR, locale);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  const keys = new Map(); // fullKey -> namespace

  for (const file of files) {
    const jsonPath = path.join(dir, file);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const domain = file.replace('.json', '');
    collectKeys(json, domain, keys);
  }

  return keys;
}

const localeKeys = Object.fromEntries(
  locales.map((l) => [l, loadLocaleKeys(l)]),
);

const baseKeys = localeKeys[BASE_LOCALE];

/* -------------------------- compare locale sets -------------------------- */
let hasErrors = false;

for (const locale of locales) {
  if (locale === BASE_LOCALE) continue;

  const current = localeKeys[locale];

  const missing = [...baseKeys.keys()].filter((k) => !current.has(k));
  const extra = [...current.keys()].filter((k) => !baseKeys.has(k));

  if (missing.length > 0) {
    hasErrors = true;
    totalMissingLocaleKeys += missing.length;

    console.error(`\n❌ [${locale}] Missing keys:`);
    console.table(missing.map((k) => ({ Key: k })));
  }

  if (extra.length > 0) {
    totalExtraLocaleKeys += extra.length;

    console.warn(`\n⚠️ [${locale}] Extra keys:`);
    console.table(extra.map((k) => ({ Key: k })));
  }
}

/* -------------------------- scan code for usage -------------------------- */
function collectCodeFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectCodeFiles(full, out);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const codeFiles = collectCodeFiles(CODE_DIR);

// Новый строгий regex: только строковые литералы a-zA-Z0-9_.-
const keyRegex = /(?:\b(?:t|i18n\.t)\b)\(\s*(['"`])([a-zA-Z0-9_.-]+)\1/g;

const usedKeys = new Set();
const usedKeysByFile = new Map(); // key -> files where used

for (const file of codeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = keyRegex.exec(content))) {
    const key = match[2];
    usedKeys.add(key);
    if (!usedKeysByFile.has(key)) usedKeysByFile.set(key, []);
    usedKeysByFile.get(key).push(path.relative(ROOT, file));
  }
}

/* --------------------------- unused key check ---------------------------- */
const unusedKeys = [...baseKeys.keys()].filter((k) => !usedKeys.has(k));

if (unusedKeys.length > 0) {
  warn('\nUnused i18n keys in base locale:');
  console.table(unusedKeys.map((k) => ({
    Key: k,
    Namespace: baseKeys.get(k),
  })));

  if (FAIL_ON_UNUSED) {
    console.error('❌ Strict mode enabled: unused keys detected');
    process.exit(1);
  }
}

/* --------------------- missing keys in locales (from code) --------------------- */
const missingInLocales = [...usedKeys].filter((k) => !baseKeys.has(k));

if (missingInLocales.length > 0) {
  console.error('\n❌ i18n keys used in code but missing in base locale:');
  console.table(
    missingInLocales.map((k) => ({
      Key: k,
      UsedIn: usedKeysByFile.get(k).join(', '),
    }))
  );
  hasErrors = true;
}

/* -------------------------------- result -------------------------------- */
console.log('\n📊 i18n summary');
console.table({
  locales: locales.length,
  'base locale keys': baseKeys.size,
  'used keys in code': usedKeys.size,
  'unused keys': unusedKeys.length,
  'missing keys in locales (from code)': missingInLocales.length,
  'missing locale keys (translations)': totalMissingLocaleKeys,
  'extra locale keys': totalExtraLocaleKeys,
});

if (hasErrors) {
  die('i18n check failed');
}

info('✅ i18n check passed');
