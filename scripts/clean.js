// scripts/clean.js
const fs = require('fs');
const path = require('path');

const itemsToDelete = [
  'node_modules',
  'pnpm-lock.yaml',
  'build',
  'dist'
];

console.log('🧹 Cleaning...\n');

itemsToDelete.forEach(item => {
  const itemPath = path.join(__dirname, '..', item);
  
  try {
    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${item}`);
    } else {
      console.log(`⏭️  Skipped: ${item} (not found)`);
    }
  } catch (error) {
    console.error(`❌ Error deleting ${item}:`, error.message);
  }
});

console.log('\n✨ Cleanup complete!');
