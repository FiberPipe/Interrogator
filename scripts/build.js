// scripts/build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Настройка
const args = process.argv.slice(2);
const skipClean = args.includes('--skip-clean');
const skipRebuild = args.includes('--skip-rebuild');
const dev = args.includes('--dev');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('\n==========================================', 'cyan');
}

function exec(command, description) {
  try {
    log(`\n${description}...`, 'yellow');
    execSync(command, { stdio: 'inherit' });
    log('[OK] ' + description + ' successful', 'green');
    return true;
  } catch (error) {
    log('[ERROR] ' + description + ' failed!', 'red');
    process.exit(1);
  }
}

// Главная функция
async function build() {
  separator();
  log('   Interrogator Build Script v1.0', 'cyan');
  separator();

  // Step 1: Preparation
  if (!skipClean) {
    log('\n[1/5] Preparing build environment...', 'yellow');
    try {
      require('./prepare-build.js');
    } catch (error) {
      log('[ERROR] Preparation failed: ' + error.message, 'red');
      process.exit(1);
    }
  } else {
    log('\n[1/5] Skipping clean (--skip-clean flag)', 'gray');
  }

  // Step 2: Prebuild checks
  log('\n[2/5] Running prebuild checks...', 'yellow');
  try {
    require('./prebuild.js');
  } catch (error) {
    log('[ERROR] Prebuild checks failed: ' + error.message, 'red');
    process.exit(1);
  }

  // Step 3: Build React
  exec('pnpm build:web', '[3/5] Building React application');

  // Step 4: Build Electron
  exec('pnpm build:electron', '[4/5] Building Electron main process');

  // Step 5: Create distributable
  if (!dev) {
    const rebuildFlag = skipRebuild ? '--config.npmRebuild=false' : '';
    exec(
      `npx electron-builder --win --x64 ${rebuildFlag}`,
      '[5/5] Creating Windows executable'
    );

    // Show results
    log('\n[OK] Build complete!', 'green');
    log('Output location: dist/', 'cyan');

    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath).filter(f => f.endsWith('.exe'));
      if (files.length > 0) {
        log('\nCreated executables:', 'green');
        files.forEach(file => {
          const filePath = path.join(distPath, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          log(`  - ${file} (${sizeMB} MB)`, 'reset');
        });
      }
    }
  } else {
    log('\n[5/5] Skipping packaging (--dev flag)', 'gray');
    log('[OK] Development build complete!', 'green');
  }

  separator();
  log('         BUILD SUCCESSFUL!', 'cyan');
  separator();
  log('');
}

// Запуск
build().catch(error => {
  log('\n[FATAL ERROR] ' + error.message, 'red');
  process.exit(1);
});
