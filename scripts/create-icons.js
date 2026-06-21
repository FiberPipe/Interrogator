// scripts/create-icons.js
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
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createAssets() {
    log('🎨 Creating installer assets templates...\n', 'cyan');

    // Создаем папку assets если её нет
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
        log('✅ Created assets directory', 'green');
    }

    // Создаем README с инструкциями
    const readme = `# Installer Assets

Эта папка содержит графические ресурсы для Windows инсталлятора.

## Требуемые файлы:

### 1. icon.ico
- **Размер:** 256x256 (может содержать несколько размеров: 16, 32, 48, 64, 128, 256)
- **Формат:** ICO
- **Назначение:** Основная иконка приложения
- **Используется:** Иконка .exe файла, ярлыки

### 2. installer-icon.ico
- **Размер:** 256x256
- **Формат:** ICO
- **Назначение:** Иконка инсталлятора
- **Используется:** Иконка Setup.exe

### 3. uninstaller-icon.ico
- **Размер:** 256x256
- **Формат:** ICO
- **Назначение:** Иконка деинсталлятора
- **Используется:** Uninstall.exe в панели управления

### 4. installer-header.bmp
- **Размер:** 150x57 пикселей
- **Формат:** BMP 24-bit
- **Назначение:** Верхний баннер окна установки
- **Рекомендации:** Используйте ваш логотип и бренд-цвета

### 5. installer-sidebar.bmp
- **Размер:** 164x314 пикселей
- **Формат:** BMP 24-bit
- **Назначение:** Боковая панель окна установки
- **Рекомендации:** Вертикальный дизайн с названием приложения

### 6. uninstaller-sidebar.bmp
- **Размер:** 164x314 пикселей
- **Формат:** BMP 24-bit
- **Назначение:** Боковая панель окна удаления
- **Рекомендации:** Может быть идентичен installer-sidebar.bmp

## 🛠 Инструменты для создания:

### ICO файлы:
- **Online:** https://icoconvert.com/ или https://convertio.co/png-ico/
- **Desktop:** GIMP, Photoshop, IcoFX
- **Требования:** Загрузите PNG 256x256, конвертируйте в ICO

### BMP файлы:
- **Online:** https://online-converting.com/image/convert2bmp/
- **Desktop:** Photoshop, GIMP, Paint.NET
- **Требования:** 
  - Создайте изображение нужного размера
  - Сохраните как BMP (24-bit, без сжатия)

## 📦 Быстрый старт (Placeholder):

Если у вас пока нет готового дизайна, используйте placeholder файлы:

1. Скачайте любую иконку 256x256 PNG
2. Конвертируйте в ICO: https://icoconvert.com/
3. Создайте BMP заглушки одного цвета в Paint/GIMP
4. Замените файлы позже на финальный дизайн

## ✅ Проверка файлов:

\`\`\`bash
pnpm assets:check
\`\`\`

Эта команда проверит наличие всех необходимых файлов.
`;

    const readmePath = path.join(ASSETS_DIR, 'README.md');
    fs.writeFileSync(readmePath, readme, 'utf-8');
    log('✅ Created README.md with instructions', 'green');

    // Создаем .gitkeep чтобы папка попала в git
    const gitkeepPath = path.join(ASSETS_DIR, '.gitkeep');
    fs.writeFileSync(gitkeepPath, '', 'utf-8');
    log('✅ Created .gitkeep', 'green');

    // Список требуемых файлов
    const requiredFiles = {
        'icon.ico': 'Main application icon (256x256 ICO)',
        'installer-icon.ico': 'Installer icon (256x256 ICO)',
        'uninstaller-icon.ico': 'Uninstaller icon (256x256 ICO)',
        'installer-header.bmp': 'Installer header (150x57 BMP 24-bit)',
        'installer-sidebar.bmp': 'Installer sidebar (164x314 BMP 24-bit)',
        'uninstaller-sidebar.bmp': 'Uninstaller sidebar (164x314 BMP 24-bit)'
    };

    log('\n📋 Required assets:', 'cyan');
    let allExists = true;

    Object.entries(requiredFiles).forEach(([file, description]) => {
        const filePath = path.join(ASSETS_DIR, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            log(`  ✅ ${file} (${sizeKB} KB)`, 'green');
        } else {
            log(`  ❌ ${file} - ${description}`, 'red');
            allExists = false;
        }
    });

    if (!allExists) {
        log('\n⚠️  Some assets are missing!', 'yellow');
        log('\n📖 Please read assets/README.md for detailed instructions', 'cyan');
        log('\n🔗 Quick links:', 'cyan');
        log('   ICO converter: https://icoconvert.com/', 'gray');
        log('   BMP converter: https://online-converting.com/image/convert2bmp/', 'gray');
        log('   Free icons: https://icons8.com/ or https://www.flaticon.com/', 'gray');
        log('\n💡 Tip: You can use placeholder images for testing', 'yellow');
        log('   Just create any 256x256 PNG and convert to ICO', 'gray');
        log('   For BMP: create solid color images of required sizes\n', 'gray');
    } else {
        log('\n✅ All required assets are present!', 'green');
    }
}

createAssets().catch(err => {
    log('❌ Error: ' + err.message, 'red');
    process.exit(1);
});
