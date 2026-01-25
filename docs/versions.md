# Interrogator - FBG Sensor Monitoring Application

Desktop приложение для мониторинга FBG (Fiber Bragg Grating) датчиков на базе Electron + React + TypeScript.

## 🏗️ Технологический стек

- **Frontend:** React 18, TypeScript 5, HeroUI (NextUI), Framer Motion, Recharts
- **Backend:** Electron 28+, Node.js 20+, SerialPort, SQL.js
- **Архитектура:** Feature-Sliced Design (FSD)
- **Сборка:** Rsbuild, Electron Builder

## 📦 Система версионирования

Проект использует двухканальную систему версионирования:

### Каналы сборки

| Канал | Назначение | Auto-update | Аудитория |
|-------|-----------|-------------|-----------|
| **Alpha** | Production | ✅ Да | Конечные пользователи |
| **Beta** | Testing | ❌ Нет | Внутреннее тестирование |

### Формат версий

- **Alpha:** `major.minor.patch` (например, `1.2.3`)
- **Beta:** `major.minor.patch-beta.N` (например, `1.3.0-beta.1`)

### Конфигурация версий

Версии управляются через файл `version.config.json`:

```json
{
  "alpha": {
    "version": "1.0.0",
    "channel": "production",
    "autoUpdate": true,
    "description": "Stable production release"
  },
  "beta": {
    "version": "1.1.0-beta.1",
    "channel": "testing",
    "autoUpdate": false,
    "description": "Internal testing release"
  },
  "buildNumber": 1,
  "lastBuild": "2024-01-15T10:30:00.000Z"
}
```

📋 Правила выкатки версий
1️⃣ Разработка новой функциональности
bash
# Шаг 1: Повышаем версию beta
pnpm version:bump:beta

# Шаг 2: Собираем beta-версию
pnpm build:beta

# Шаг 3: Тестируем
# Файл будет в dist/Interrogator-beta-1.1.0-beta.1-portable.exe
2️⃣ Исправление багов в beta
bash
# Автоматически увеличивает номер beta
# 1.1.0-beta.1 -> 1.1.0-beta.2
pnpm version:bump:beta

pnpm build:beta
3️⃣ Выкатка в production (alpha)
После успешного тестирования beta-версии:

bash
# Вариант 1: Продвижение beta -> alpha
pnpm version:promote
pnpm build:alpha

# Вариант 2: Ручное повышение версии alpha
pnpm version:bump:alpha        # patch: 1.0.0 -> 1.0.1
pnpm version:bump:alpha:minor  # minor: 1.0.0 -> 1.1.0
pnpm version:bump:alpha:major  # major: 1.0.0 -> 2.0.0

pnpm build:alpha
4️⃣ Экстренное исправление (hotfix)
bash
# Повышаем patch-версию alpha
pnpm version:bump:alpha

# Быстрая сборка без пересборки зависимостей
pnpm build:quick --channel=alpha
🔄 Типы версий (Semantic Versioning)
MAJOR (X.0.0)
Когда делать:

Несовместимые изменения API
Полный редизайн интерфейса
Изменение формата данных
Удаление функциональности
bash
pnpm version:bump:alpha:major
# 1.5.3 -> 2.0.0
MINOR (0.X.0)
Когда делать:

Новая функциональность (обратно совместимая)
Улучшения UI/UX
Новые виджеты/страницы
Оптимизация производительности
bash
pnpm version:bump:alpha:minor
# 1.5.3 -> 1.6.0
PATCH (0.0.X)
Когда делать:

Исправление багов
Мелкие улучшения
Обновление зависимостей
Правки документации
bash
pnpm version:bump:alpha
# 1.5.3 -> 1.5.4
📊 Жизненный цикл релиза
mermaid
graph LR
    A[Разработка] --> B[Beta 1.1.0-beta.1]
    B --> C{Тестирование}
    C -->|Баги| D[Beta 1.1.0-beta.2]
    D --> C
    C -->|OK| E[Promote to Alpha]
    E --> F[Alpha 1.1.0]
    F --> G[Production]
    
    H[Hotfix] --> I[Alpha 1.1.1]
    I --> G
Пример рабочего процесса
Неделя 1-2: Разработка

bash
pnpm version:bump:beta        # 1.1.0-beta.1
pnpm build:beta
# Внутреннее тестирование
Неделя 2: Баг-фиксы

bash
pnpm version:bump:beta        # 1.1.0-beta.2
pnpm build:beta
# Повторное тестирование
Неделя 3: Релиз

bash
pnpm version:promote          # beta -> alpha (1.1.0)
pnpm build:alpha
# Выкатка пользователям
Экстренное исправление

bash
pnpm version:bump:alpha       # 1.1.0 -> 1.1.1
pnpm build:quick --channel=alpha
🔨 Команды сборки
Полная сборка
bash
# Production (alpha)
pnpm build:alpha

# Testing (beta)
pnpm build:beta

# Development (без упаковки)
pnpm build:dev
Быстрая сборка
bash
# Без очистки и пересборки зависимостей
pnpm build:quick

# С конкретным каналом
node scripts/build.js --channel=beta --skip-clean --skip-rebuild
PowerShell
powershell
# Alpha
.\scripts\build.ps1 -Channel alpha

# Beta
.\scripts\build.ps1 -Channel beta

# Быстрая
.\scripts\build.ps1 -Channel alpha -SkipClean -SkipRebuild
📂 Результаты сборки
После сборки файлы появятся в папке dist/:

text
dist/
├── Interrogator-alpha-1.0.0-portable.exe
├── Interrogator-beta-1.1.0-beta.1-portable.exe
├── build-meta-alpha.json
└── build-meta-beta.json
Метаданные сборки
Каждая сборка создает JSON-файл с метаданными:

json
{
  "version": "1.0.0",
  "channel": "alpha",
  "buildNumber": 42,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "autoUpdate": true,
  "description": "Stable production release"
}
🧪 Управление версиями
Просмотр информации
bash
pnpm version:info
Вывод:

yaml
📊 Version Information:

Alpha (Production):
  Version: 1.0.0
  Channel: production
  Auto-update: true

Beta (Testing):
  Version: 1.1.0-beta.1
  Channel: testing
  Auto-update: false

Build Number: 42
Last Build: 2024-01-15T10:30:00.000Z
Синхронизация версий
bash
# Синхронизировать version.config.json с package.json
pnpm version:sync
🧹 Очистка
bash
# Очистка build и dist
pnpm clean:build

# Очистка node_modules
pnpm clean:modules

# Полная очистка + переустановка
pnpm clean:install

# Очистка всего
pnpm clean:all
📝 Лучшие практики
✅ DO
Всегда тестируйте в beta перед alpha
Увеличивайте версию перед каждой сборкой
Используйте version:promote для стабильных релизов
Документируйте изменения в changelog
Проверяйте version:info перед сборкой
❌ DON'T
Не собирайте alpha без тестирования в beta
Не используйте одинаковые версии для разных сборок
Не пропускайте версии
Не редактируйте version.config.json вручную
🐛 Troubleshooting
Ошибка: "Version not synced"
bash
pnpm version:sync
pnpm build
Ошибка сборки native модулей
bash
# Полная пересборка
pnpm clean:install
pnpm build:alpha
Конфликт версий
bash
# Сброс к исходному состоянию
git checkout version.config.json
pnpm version:sync
📜 Changelog
Как вести changelog
Создайте CHANGELOG.md в корне:

markdown
# Changelog

## [1.1.0] - 2024-01-15

### Added
- Новый виджет графиков
- Экспорт данных в CSV

### Changed
- Улучшена производительность
- Обновлен дизайн настроек

### Fixed
- Исправлена ошибка подключения к порту
- Устранена утечка памяти

## [1.0.1] - 2024-01-10

### Fixed
- Hotfix для критической ошибки
🤝 Contributing
Создайте feature branch: git checkout -b feature/my-feature
Зафиксируйте изменения: git commit -am 'Add feature'
Отправьте в удаленный репозиторий: git push origin feature/my-feature
Создайте Pull Request
📄 Лицензия
Proprietary - Все права защищены

👥 Авторы
Your Name - initial work

🔗 Полезные ссылки
Electron Documentation
React Documentation
Feature-Sliced Design
Semantic Versioning
markdown

Теперь у вас есть:

1. ✅ **Полный package.json** с системой версионирования
2. ✅ **Подробный README.md** с правилами выкатки
3. ✅ **Примеры использования** всех команд
4. ✅ **Best practices** и troubleshooting
5. ✅ **Диаграммы** жизненного цикла релиза
6. ✅ **Четкие правила** когда использовать major/minor/patch

Хотите что-то добавить или изменить?
