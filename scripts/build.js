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
    log('\n[1/6] Preparing build environment...', 'yellow');
    try {
      require('./prepare-build.js');
    } catch (error) {
      log('[ERROR] Preparation failed: ' + error.message, 'red');
      process.exit(1);
    }
  } else {
    log('\n[1/6] Skipping clean (--skip-clean flag)', 'gray');
  }

  // Step 2: Prebuild checks
  log('\n[2/6] Running prebuild checks...', 'yellow');
  try {
    require('./prebuild.js');
  } catch (error) {
    log('[ERROR] Prebuild checks failed: ' + error.message, 'red');
    process.exit(1);
  }

  // Step 3: Build React
  exec('pnpm build:web', '[3/6] Building React application');

  // Step 4: Build Electron
  exec('pnpm build:electron', '[4/6] Building Electron main process');

  // Step 5: Check assets
  log('\n[5/6] Checking installer assets...', 'yellow');
  const assetsPath = path.join(__dirname, '..', 'assets');
  const requiredAssets = [
    'icon.ico',
    'installer-icon.ico',
    'uninstallerIcon.ico',
    'installer-header.bmp',
    'installer-sidebar.bmp',
    'uninstaller-sidebar.bmp'
  ];

  const missingAssets = requiredAssets.filter(asset => 
    !fs.existsSync(path.join(assetsPath, asset))
  );

  if (missingAssets.length > 0) {
    log(`⚠️  Missing assets: ${missingAssets.join(', ')}`, 'yellow');
    log('ℹ️  Run: pnpm assets:create', 'cyan');
  } else {
    log('✅ All installer assets found', 'green');
  }

  // Step 6: Create distributable
  if (!dev) {
    const rebuildFlag = skipRebuild ? '--config.npmRebuild=false' : '';
    const productName = channel === 'beta' ? 'Interrogator Beta' : 'Interrogator';
    
    // Устанавливаем переменные окружения для NSIS
    process.env.PRODUCT_NAME = productName;
    process.env.PRODUCT_FILENAME = productName.replace(' ', '');
    process.env.VERSION = version;
    
    exec(
      `npx electron-builder --win --x64 ${rebuildFlag} --config.productName="${productName}"`,
      '[6/6] Creating Windows installer'
    );

    // Информация о созданных файлах
    const distPath = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath).filter(f => 
        f.endsWith('.exe') || f.endsWith('.yaml') || f.endsWith('.yml')
      );
      
      log('\n📦 Created files:', 'green');
      files.forEach(file => {
        const filePath = path.join(distPath, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        if (file.endsWith('.exe')) {
          log(`  🟢 ${file} (${sizeMB} MB)`, 'green');
        } else {
          log(`  📄 ${file}`, 'gray');
        }
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
      installerType: 'nsis',
      features: {
        desktopShortcut: true,
        startMenuShortcut: true,
        runAfterInstall: true,
        perUserInstall: true
      }
    };

    const metaPath = path.join(distPath, `build-meta-${channel}.json`);
    fs.writeFileSync(metaPath, JSON.stringify(buildMeta, null, 2));
    log(`\n📄 Build metadata: ${metaPath}`, 'cyan');

  } else {
    log('\n[6/6] Skipping packaging (--dev flag)', 'gray');
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

