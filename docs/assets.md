Создайте файл ASSETS_GUIDE.md:

markdown
# Руководство по созданию ассетов для инсталлятора

## Быстрый старт (5 минут)

### Шаг 1: Создайте основную иконку

1. Найдите или создайте PNG изображение 256x256 пикселей
2. Перейдите на https://icoconvert.com/
3. Загрузите PNG
4. Скачайте ICO файл
5. Сохраните как:
   - `assets/icon.ico`
   - `assets/installer-icon.ico` (копия)
   - `assets/uninstaller-icon.ico` (копия)

### Шаг 2: Создайте BMP баннеры

**Вариант A: Онлайн (проще)**

1. Создайте изображения в Figma/Canva:
   - Header: 150×57 пикселей
   - Sidebar: 164×314 пикселей
2. Экспортируйте как PNG
3. Конвертируйте в BMP: https://online-converting.com/image/convert2bmp/
4. Выберите "24-bit BMP"
5. Сохраните в `assets/`

**Вариант B: GIMP (бесплатный редактор)**

1. Скачайте GIMP: https://www.gimp.org/
2. Создайте новое изображение нужного размера
3. Нарисуйте дизайн
4. File → Export As → выберите BMP
5. В настройках: "24-bit"

**Вариант C: Photoshop**

1. Новый файл нужного размера
2. Дизайн
3. Save As → BMP → 24-bit

### Шаг 3: Проверка

```bash
pnpm assets:check
Требования к файлам
Файл	Размер	Формат	Описание
icon.ico	256×256	ICO	Основная иконка
installer-icon.ico	256×256	ICO	Иконка setup.exe
uninstaller-icon.ico	256×256	ICO	Иконка удаления
installer-header.bmp	150×57	BMP 24-bit	Верхний баннер
installer-sidebar.bmp	164×314	BMP 24-bit	Боковая панель
uninstaller-sidebar.bmp	164×314	BMP 24-bit	Панель удаления
Дизайн рекомендации
Цветовая схема
Используйте корпоративные цвета
Header: простой дизайн, логотип + название
Sidebar: вертикальный дизайн, больше деталей
Примеры макетов
installer-header.bmp (150×57)

css
┌────────────────────────────────┐
│  [Logo]  Interrogator   v1.0   │
└────────────────────────────────┘
installer-sidebar.bmp (164×314)

css
┌───────────┐
│           │
│   [Icon]  │
│           │
│Interrogator
│           │
│   FBG     │
│  Sensor   │
│ Monitor   │
│           │
│  v1.0.0   │
│           │
└───────────┘
Бесплатные ресурсы
Иконки
https://icons8.com/
https://www.flaticon.com/
https://heroicons.com/
Дизайн инструменты
Figma (онлайн): https://www.figma.com/
Canva: https://www.canva.com/
GIMP: https://www.gimp.org/
Конвертеры
PNG → ICO: https://icoconvert.com/
PNG → BMP: https://online-converting.com/image/convert2bmp/
Универсальный: https://convertio.co/
Troubleshooting
"File too small" предупреждение
BMP файлы должны быть несжатые, 24-bit
Проверьте размеры в пикселях
Используйте правильный формат (не PNG с расширением .bmp)
ICO файл не работает
Должен содержать хотя бы размер 256×256
Формат: ICO (не PNG/BMP)
Используйте специальные конвертеры
Цвета выглядят некорректно
BMP должен быть 24-bit (не 8-bit, не 32-bit)
Конвертируйте из PNG без альфа-канала
shell

## 6. Теперь используйте команды:

```bash
# 1. Создать README и проверить папку
pnpm assets:create

# 2. Создать SVG заглушки
pnpm assets:placeholder

# 3. Вручную конвертировать SVG → ICO и BMP
# (используя онлайн инструменты)

# 4. Проверить результат
pnpm assets:check

# 5. Собрать приложение
pnpm build:alpha
Теперь скрипт работает на macOS и дает четкие инструкции! 🎉

