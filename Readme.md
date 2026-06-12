# Interrogator

Десктопное приложение для сбора и визуализации данных с аппаратных датчиков в реальном времени.

- Поддержка 16 каналов датчиков (мощность, длина волны, температура, смещение)
- Подключение через Serial Port (USB)
- Локальное хранение данных в SQLite
- Графики реального времени
- Интерфейс на 3 языках: English / Русский / 中文

---

## Требования

| Инструмент | Версия | Назначение |
|-----------|--------|-----------|
| Node.js | ≥ 20 | Runtime |
| pnpm | ≥ 9 | Менеджер пакетов |
| Python | ≥ 3.10 | Алгоритмы демодуляции |

> **Windows:** для нативных модулей SerialPort нужен [Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) с компонентом "Desktop development with C++".

---

## Быстрый старт

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd Interrogator

# 2. Установить зависимости
pnpm install

# 3. Настроить переменные окружения
cp .env.example .env

# 4. Запустить в режиме разработки
pnpm dev:electron
```

---

## Переменные окружения

Создайте файл `.env` в корне проекта (скопируйте из `.env.example`):

```env
# Режим окружения: development | production
NODE_ENV=development

# Включить моковые порты вместо реального Serial Port
# true — полезно для разработки без железа
WITH_MOCK_PORTS=false
```

---

## Команды разработки

```bash
# Полный Electron с hot-reload (React + main process)
pnpm dev:electron

# Только веб-версия в браузере (порт 3000)
pnpm dev:web
```

**Как работает `dev:electron`:**
1. Запускает Rsbuild dev-сервер на `http://127.0.0.1:3000`
2. Ждёт пока сервер поднимется (`wait-on`)
3. Запускает TypeScript-компилятор для main process в режиме watch
4. Запускает Electron, который загружает приложение с dev-сервера

---

## Сборка

### Переменные перед сборкой

Все команды `build` читают `.env` через `export $(cat .env)`. Убедитесь, что `.env` содержит актуальные значения.

### Команды сборки

```bash
# Production-релиз (NSIS-инсталлятор для Windows)
pnpm build

# Alpha-версия
pnpm build:alpha

# Beta-версия
pnpm build:beta

# Dev-сборка (без публикации, для отладки инсталлятора)
pnpm build:dev

# Быстрая пересборка (пропустить clean + rebuild нативных модулей)
pnpm build:quick
```

Артефакты попадают в `dist/`:
```
dist/
└── Interrogator-<channel>-<version>-Setup.exe
```

### Поэтапная сборка вручную

```bash
# 1. Подготовить окружение (копирует ресурсы, проверяет ассеты)
pnpm prepare:build

# 2. Предварительные проверки (i18n, версии, иконки)
pnpm prebuild

# 3. Собрать React-приложение
pnpm build:web

# 4. Скомпилировать main process (TypeScript → JS)
pnpm build:electron

# 5. Упаковать в инсталлятор
pnpm build
```

---

## Управление версиями

Версии хранятся в `version.config.json`. Каналы: `alpha` (stable), `beta` (testing).

```bash
# Посмотреть текущую версию
pnpm version:info

# Синхронизировать version.config.json → package.json
pnpm version:sync

# Patch-bump текущего канала (1.0.0 → 1.0.1)
pnpm version:bump

# Bump alpha-канала
pnpm version:bump:alpha

# Bump beta-канала
pnpm version:bump:beta

# Minor bump для beta
pnpm version:bump:beta:minor

# Major bump для beta
pnpm version:bump:beta:major

# Повысить beta → alpha (promote release)
pnpm version:promote
```

---

## Качество кода

```bash
# Проверить TypeScript
tsc --noEmit

# Lint
pnpm lint
pnpm lint:fix

# Форматирование
pnpm format:check
pnpm format:fix

# Проверить полноту переводов (EN/RU/ZH)
pnpm check:i18n
```

Git-хуки (Husky) запускают lint и format:check автоматически перед каждым коммитом.

---

## Ассеты / Иконки

```bash
# Создать иконки приложения из assets/icon.svg
pnpm assets:create

# Проверить наличие всех необходимых ассетов
pnpm assets:check

# Создать placeholder-ассеты (если SVG ещё нет)
pnpm assets:placeholder
```

---

## Очистка

```bash
# Удалить скомпилированный build/ и dist/
pnpm clean

# Удалить node_modules и lock-файл
pnpm clean:modules

# Переустановить зависимости с нуля
pnpm clean:install

# Полная очистка (build + dist + node_modules)
pnpm clean:all
```

---

## Структура проекта

```
src/
├── app/           # Точка входа React, провайдеры, роутер
├── pages/         # Страницы: Settings, Charts, Logs, Onboarding
├── widgets/       # Составные компоненты (MonitoringDashboard, Sidebar…)
├── features/      # Функциональные модули по FSD
├── entities/      # Типы данных (sensor, chart, log…)
├── shared/        # API-мосты, типы, i18n, утилиты
└── electron/      # Main process: serial, database, logger, app-data
```

Подробная архитектурная схема — в [agents.md](agents.md).

---

## Разработка без железа

Для работы без физического устройства включите моковые порты:

```env
# .env
WITH_MOCK_PORTS=true
```

Мок (`mock-port.service.ts`) генерирует случайные данные по всем 16 каналам с тем же форматом, что и реальное устройство.

---

## База данных

- Движок: **sql.js** (SQLite в памяти, сериализуется в файл)
- Файл: `sensor-data.db`
- Расположение: настраивается в Settings (appData / Documents / custom path)
- Лимит: 100 МБ
- Таблицы: `sensor_data`, `channel_data`, `sessions`, `logs`

---

## Python-интеграция

Алгоритмы демодуляции сигнала запускаются как subprocess:

| Метод | Путь |
|-------|------|
| COG LUT | `src/electron/features/serial/shared/demodulation_methods/cog/src/cog_lut_demod.py` |
| InterrogatorStream | `src/electron/features/serial/shared/demodulation_methods/interrogatorstream/` |

Python-процесс принимает данные через stdin, отдаёт JSON через stdout. Конфигурируется в настройках приложения.

---

## Известные особенности

- **Windows only:** инсталлятор собирается только под `win32/x64` (NSIS)
- **SerialPort нативный модуль:** после смены версии Node.js нужен `pnpm rebuild` или `pnpm clean:install`
- **sql.js WASM:** файл `sql-wasm.wasm` копируется в `extraResources` при сборке автоматически
