// scripts/check-assets.js
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

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

const requiredAssets = [
  { 
    name: 'icon.ico', 
    description: 'Main app icon',
    size: '256x256',
    format: 'ICO',
    minSize: 1024 // bytes
  },
  { 
    name: 'installer-icon.ico', 
    description: 'Installer icon',
    size: '256x256',
    format: 'ICO',
    minSize: 1024
  },
  { 
    name: 'uninstaller-icon.ico', 
    description: 'Uninstaller icon',
    size: '256x256',
    format: 'ICO',
    minSize: 1024
  },
  { 
    name: 'installer-header.bmp', 
    description: 'Header banner',
    size: '150x57',
    format: 'BMP 24-bit',
    minSize: 25000
  },
  { 
    name: 'installer-sidebar.bmp', 
    description: 'Sidebar image',
    size: '164x314',
    format: 'BMP 24-bit',
    minSize: 150000
  },
  { 
    name: 'uninstaller-sidebar.bmp', 
    description: 'Uninstaller sidebar',
    size: '164x314',
    format: 'BMP 24-bit',
    minSize: 150000
  }
];

function checkAssets() {
  log('\n🔍 Checking installer assets...\n', 'cyan');

  if (!fs.existsSync(ASSETS_DIR)) {
    log('❌ Assets directory not found!', 'red');
    log('💡 Run: pnpm assets:create', 'yellow');
    process.exit(1);
  }

  let missing = [];
  let warnings = [];
  let valid = [];

  requiredAssets.forEach(asset => {
    const filePath = path.join(ASSETS_DIR, asset.name);
    
    if (!fs.existsSync(filePath)) {
      missing.push(asset);
      log(`❌ ${asset.name}`, 'red');
      log(`   ${asset.description} (${asset.size} ${asset.format})`, 'gray');
    } else {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      if (stats.size < asset.minSize) {
        warnings.push(asset);
        log(`⚠️  ${asset.name} (${sizeKB} KB)`, 'yellow');
        log(`   File seems too small, expected ~${(asset.minSize / 1024).toFixed(0)} KB`, 'gray');
      } else {
        valid.push(asset);
        log(`✅ ${asset.name} (${sizeKB} KB)`, 'green');
      }
    }
  });

  log('\n' + '='.repeat(50), 'cyan');
  log(`📊 Summary:`, 'cyan');
  log(`   ✅ Valid: ${valid.length}`, 'green');
  log(`   ⚠️  Warnings: ${warnings.length}`, 'yellow');
  log(`   ❌ Missing: ${missing.length}`, 'red');
  log('='.repeat(50) + '\n', 'cyan');

  if (missing.length > 0) {
    log('❌ Build will fail! Missing required assets.\n', 'red');
    log('📖 Instructions:', 'cyan');
    log('   1. Read: assets/README.md', 'gray');
    log('   2. Create missing files using online tools:', 'gray');
    log('      - ICO: https://icoconvert.com/', 'gray');
    log('      - BMP: https://online-converting.com/image/convert2bmp/', 'gray');
    log('   3. Run: pnpm assets:check\n', 'gray');
    process.exit(1);
  }

  if (warnings.length > 0) {
    log('⚠️  Some files may not be valid. Check sizes and formats.\n', 'yellow');
  } else {
    log('✅ All assets are valid! Ready to build.\n', 'green');
  }
}

checkAssets();
