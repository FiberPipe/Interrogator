// scripts/prepare-build.js
const fs = require('fs');
const path = require('path');

console.log('🧹 Preparing build environment...\n');

const itemsToClean = ['build', 'dist'];

itemsToClean.forEach(item => {
  const itemPath = path.join(__dirname, '..', item);
  
  try {
    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`✅ Cleaned: ${item}`);
    } else {
      console.log(`⏭️  Skipped: ${item} (not found)`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${item}:`, error.message);
  }
});

console.log('\n✨ Preparation complete!\n');
