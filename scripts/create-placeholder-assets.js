// scripts/create-placeholder-assets.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

log('\n🎨 Placeholder Asset Generator\n', 'cyan');
log('⚠️  This creates minimal placeholder files for testing', 'yellow');
log('⚠️  Replace with real assets before production release!\n', 'yellow');

if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Создаем SVG заглушку для иконки
const iconSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#2196F3"/>
  <text x="128" y="140" font-size="72" fill="white" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold">I</text>
  <text x="128" y="180" font-size="24" fill="white" text-anchor="middle" font-family="Arial, sans-serif">Interrogator</text>
</svg>`;

const iconPath = path.join(ASSETS_DIR, 'icon.svg');
fs.writeFileSync(iconPath, iconSVG);
log('✅ Created icon.svg template', 'green');

// Создаем BMP заглушки (простые однотонные изображения)
function createBMPPlaceholder(width, height, filename, text = '') {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>
  ${text ? `<text x="${width / 2}" y="${height / 2}" font-size="18" fill="white" text-anchor="middle" font-family="Arial" font-weight="bold">${text}</text>` : ''}
</svg>`;

    const svgPath = path.join(ASSETS_DIR, filename.replace('.bmp', '.svg'));
    fs.writeFileSync(svgPath, svg);
    log(`✅ Created ${filename.replace('.bmp', '.svg')} template`, 'green');
}

createBMPPlaceholder(150, 57, 'installer-header.bmp', 'Interrogator');
createBMPPlaceholder(164, 314, 'installer-sidebar.bmp', 'Interrogator\nInstaller');
createBMPPlaceholder(164, 314, 'uninstaller-sidebar.bmp', 'Interrogator\nUninstaller');

log('\n📋 Next Steps:\n', 'cyan');
log('1. Convert SVG files to required formats:', 'yellow');
log('   - icon.svg → icon.ico (use https://icoconvert.com/)', 'gray');
log('   - Also copy to installer-icon.ico and uninstaller-icon.ico', 'gray');
log('   - *.svg → *.bmp (use https://online-converting.com/image/convert2bmp/)', 'gray');
log('\n2. Or use any image editor:', 'yellow');
log('   - GIMP (free): https://www.gimp.org/', 'gray');
log('   - Photoshop', 'gray');
log('   - Paint.NET (Windows): https://www.getpaint.net/', 'gray');
log('\n3. Verify with: pnpm assets:check\n', 'yellow');

log('💡 Files created in: ' + ASSETS_DIR, 'magenta');
