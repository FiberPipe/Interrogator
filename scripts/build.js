// scripts/build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const VersionManager = require('./version-manager');

// Настройка
const args = process.argv.slice(2);
const skipClean = args.includes('--skip-clean');
const skipRebuild = args.includes('--skip-rebuild');
const dev = args.includes('--dev');
const channelArg = args.find(arg => arg.startsWith('--channel='));
const channel = channelArg ? channelArg.split('=')[1] : 'alpha';

// Устанавливаем переменную окружения
process.env.BUILD_CHANNEL = channel;

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
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
    execSync(command, { stdio: 'inherit', env: process.env });
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

  // Version Management
  const vm = new VersionManager();
  const version = vm.getVersion(channel);
  const buildConfig = vm.config[channel];

  log(`\n📦 Building for channel: ${channel.toUpperCase()}`, 'magenta');
  log(`📌 Version: ${version}`, 'magenta');
  log(`🏷️  Description: ${buildConfig.description}`, 'gray');
  separator();

  // Sync version to package.json
  vm.sync();

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
    const productName = channel === 'beta' ? 'Interrogator Beta' : 'Interrogator';
    
    exec(
      `npx electron-builder --win --x64 ${rebuildFlag} --config.productName="${productName}"`,
      '[5/5] Creating Windows executable'
    );

    // Переименование файлов по каналу
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath).filter(f => f.endsWith('.exe'));
      
      files.forEach(file => {
        const oldPath = path.join(distPath, file);
        const newName = file.replace('.exe', `-${channel}-${version}.exe`);
        const newPath = path.join(distPath, newName);
        
        fs.renameSync(oldPath, newPath);
        
        const stats = fs.statSync(newPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        log(`\n📦 Created: ${newName} (${sizeMB} MB)`, 'green');
      });
    }

    // Создание метаданных сборки
    const buildMeta = {
      version,
      channel,
      buildNumber: vm.config.buildNumber,
      timestamp: new Date().toISOString(),
      autoUpdate: buildConfig.autoUpdate,
      description: buildConfig.description,
    };

    const metaPath = path.join(distPath, `build-meta-${channel}.json`);
    fs.writeFileSync(metaPath, JSON.stringify(buildMeta, null, 2));
    log(`\n📄 Build metadata: ${metaPath}`, 'cyan');

  } else {
    log('\n[5/5] Skipping packaging (--dev flag)', 'gray');
    log('[OK] Development build complete!', 'green');
  }

  separator();
  log('         BUILD SUCCESSFUL!', 'cyan');
  log(`         Channel: ${channel.toUpperCase()} | Version: ${version}`, 'cyan');
  separator();
  log('');
}

// Запуск
build().catch(error => {
  log('\n[FATAL ERROR] ' + error.message, 'red');
  process.exit(1);
});
