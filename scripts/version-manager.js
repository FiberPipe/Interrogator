// scripts/version-manager.js
const fs = require('fs');
const path = require('path');

const VERSION_CONFIG = path.join(__dirname, '..', 'version.config.json');
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');

class VersionManager {
  constructor() {
    this.config = this.loadConfig();
    this.packageJson = this.loadPackageJson();
  }

  loadConfig() {
    if (!fs.existsSync(VERSION_CONFIG)) {
      console.error('❌ version.config.json not found!');
      console.error('Creating default version.config.json...');

      const defaultConfig = {
        alpha: {
          version: '1.0.0',
          channel: 'production',
          autoUpdate: true,
          description: 'Stable production release',
        },
        beta: {
          version: '1.1.0-beta.1',
          channel: 'testing',
          autoUpdate: false,
          description: 'Internal testing release',
        },
        buildNumber: 1,
        lastBuild: '',
      };

      fs.writeFileSync(VERSION_CONFIG, JSON.stringify(defaultConfig, null, 2));
      return defaultConfig;
    }
    return JSON.parse(fs.readFileSync(VERSION_CONFIG, 'utf-8'));
  }

  loadPackageJson() {
    return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));
  }

  saveConfig() {
    fs.writeFileSync(VERSION_CONFIG, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  savePackageJson() {
    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(this.packageJson, null, 2), 'utf-8');
  }

  getCurrentChannel() {
    return process.env.BUILD_CHANNEL || 'alpha';
  }

  getVersion(channel = null) {
    const ch = channel || this.getCurrentChannel();
    if (!this.config[ch]) {
      console.error(`❌ Unknown channel: ${ch}`);
      process.exit(1);
    }
    return this.config[ch].version;
  }

  incrementVersion(channel, type = 'patch') {
    if (!this.config[channel]) {
      console.error(`❌ Unknown channel: ${channel}`);
      process.exit(1);
    }

    const current = this.config[channel].version;
    const parts = current.replace(/-beta\.\d+/, '').split('.');
    let [major, minor, patch] = parts.map(Number);

    switch (type) {
      case 'major':
        major++;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor++;
        patch = 0;
        break;
      case 'patch':
        patch++;
        break;
      default:
        console.error(`❌ Unknown version type: ${type}`);
        process.exit(1);
    }

    let newVersion = `${major}.${minor}.${patch}`;

    if (channel === 'beta') {
      // Извлекаем номер бета версии
      const betaMatch = current.match(/-beta\.(\d+)/);
      const betaNum = betaMatch ? parseInt(betaMatch[1]) + 1 : 1;
      newVersion += `-beta.${betaNum}`;
    }

    this.config[channel].version = newVersion;
    return newVersion;
  }

  bump(channel, type = 'patch') {
    const newVersion = this.incrementVersion(channel, type);
    this.config.buildNumber++;
    this.config.lastBuild = new Date().toISOString();
    this.saveConfig();

    console.log(`✅ Bumped ${channel} version to ${newVersion}`);
    console.log(`📦 Build number: ${this.config.buildNumber}`);

    return newVersion;
  }

  sync() {
    const channel = this.getCurrentChannel();
    const version = this.getVersion(channel);

    this.packageJson.version = version;
    this.savePackageJson();

    console.log(`✅ Synced package.json to ${channel}: ${version}`);
  }

  info() {
    console.log('\n📊 Version Information:\n');
    console.log('Alpha (Production):');
    console.log(`  Version: ${this.config.alpha.version}`);
    console.log(`  Channel: ${this.config.alpha.channel}`);
    console.log(`  Auto-update: ${this.config.alpha.autoUpdate}\n`);

    console.log('Beta (Testing):');
    console.log(`  Version: ${this.config.beta.version}`);
    console.log(`  Channel: ${this.config.beta.channel}`);
    console.log(`  Auto-update: ${this.config.beta.autoUpdate}\n`);

    console.log(`Build Number: ${this.config.buildNumber}`);
    console.log(`Last Build: ${this.config.lastBuild || 'Never'}\n`);
  }

  promote() {
    // Продвигаем beta версию в alpha
    const betaVersion = this.config.beta.version.replace(/-beta\.\d+/, '');
    this.config.alpha.version = betaVersion;
    this.saveConfig();

    console.log(`✅ Promoted beta to alpha: ${betaVersion}`);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const channel = args[1] || process.env.BUILD_CHANNEL || 'alpha';
  const type = args[2] || 'patch';

  const vm = new VersionManager();

  switch (command) {
    case 'bump':
      vm.bump(channel, type);
      break;
    case 'sync':
      vm.sync();
      break;
    case 'info':
      vm.info();
      break;
    case 'promote':
      vm.promote();
      break;
    default:
      console.log('Usage:');
      console.log('  node version-manager.js bump [alpha|beta] [major|minor|patch]');
      console.log('  node version-manager.js sync');
      console.log('  node version-manager.js info');
      console.log('  node version-manager.js promote');
      process.exit(1);
  }
}

module.exports = VersionManager;
