🚀 Установка
bash
# Клонирование репозитория
git clone <repository-url>
cd interrogator

# Установка зависимостей
pnpm install

# Проверка версий
pnpm version:info
🛠️ Разработка
Запуск в режиме разработки
bash
# Web-версия (для тестирования UI)
pnpm dev:web

# Desktop-версия (Electron)
pnpm dev:electron
Структура проекта
bash
interrogator/
├── src/
│   ├── app/              # Точка входа приложения
│   ├── pages/            # Страницы
│   ├── widgets/          # Виджеты
│   ├── features/         # Функциональные модули
│   ├── entities/         # Бизнес-сущности
│   ├── shared/           # Общие компоненты
│   └── electron/         # Electron main process
├── scripts/              # Скрипты сборки
├── assets/               # Ресурсы
└── version.config.json   # Конфигурация версий