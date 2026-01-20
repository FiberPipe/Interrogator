// scripts/prebuild.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Running prebuild tasks...\n');

// 1. Проверка наличия build директорий
const checkDirs = ['src/electron', 'src/app'];
let hasErrors = false;

checkDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Required directory missing: ${dir}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found: ${dir}`);
  }
});

if (hasErrors) {
  console.error('\n❌ Prebuild checks failed!');
  process.exit(1);
}

// 2. Проверка TypeScript конфигурации
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.electron.json');
if (!fs.existsSync(tsConfigPath)) {
  console.error('❌ tsconfig.electron.json not found!');
  process.exit(1);
}
console.log('✅ Found: tsconfig.electron.json');

// 3. Проверка Rsbuild конфигурации
const rsbuildConfigPath = path.join(__dirname, '..', 'rsbuild.config.ts');
if (!fs.existsSync(rsbuildConfigPath)) {
  console.error('❌ rsbuild.config.ts not found!');
  process.exit(1);
}
console.log('✅ Found: rsbuild.config.ts');

console.log('\n✨ Prebuild checks passed!\n');
