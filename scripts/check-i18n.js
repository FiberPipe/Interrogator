#!/usr/bin/env node
/* eslint-disable no-console */
let totalMissingLocaleKeys = 0;
let totalExtraLocaleKeys = 0;
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src/shared/i18n/locales');
const CODE_DIR = path.join(ROOT, 'src');

const BASE_LOCALE = 'en';
const FAIL_ON_UNUSED = process.argv.includes('--fail-unused');

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

function collectKeys(obj, prefix, out) {
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            collectKeys(value, fullKey, out);
        } else {
            out.add(fullKey);
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

    const keys = new Set();

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

    const missing = [...baseKeys].filter((k) => !current.has(k));
    const extra = [...current].filter((k) => !baseKeys.has(k));

    if (missing.length > 0) {
        hasErrors = true;
        totalMissingLocaleKeys += missing.length;

        console.error(`❌ [${locale}] Missing keys:`);
        missing.forEach((k) => console.error(`   - ${k}`));
    }

    if (extra.length > 0) {
        totalExtraLocaleKeys += extra.length;

        warn(`[${locale}] Extra keys:`);
        extra.forEach((k) => warn(`   - ${k}`));
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

const usedKeys = new Set();
const keyRegex = /(?:t|i18n\.t)\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

for (const file of codeFiles) {
    const content = fs.readFileSync(file, 'utf8');

    let match;
    while ((match = keyRegex.exec(content))) {
        usedKeys.add(match[1]);
    }
}

/* --------------------------- unused key check ---------------------------- */

const unusedKeys = [...baseKeys].filter((k) => !usedKeys.has(k));

if (unusedKeys.length > 0) {
    warn('Unused i18n keys:');
    unusedKeys.forEach((k) => warn(`   - ${k}`));

    if (FAIL_ON_UNUSED) {
        console.error('❌ Strict mode enabled: unused keys detected');
        process.exit(1);
    }
}

/* --------------------- missing keys in locales (from code) --------------------- */

const missingInLocales = [...usedKeys].filter((k) => !baseKeys.has(k));

if (missingInLocales.length > 0) {
    console.error('❌ i18n keys used in code but missing in locales:');
    missingInLocales.forEach((k) => console.error(`   - ${k}`));
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

