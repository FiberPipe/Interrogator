src/electron/features/logger/
│
├── index.ts                    # Точка входа, экспортирует все публичное API
├── logger.ts                   # Основной класс Logger (Main Process)
├── logger.types.ts             # Типы, специфичные для electron (enum, IPC)
├── logger.constants.ts         # Константы (размеры, цвета, пути)
├── logger.utils.ts             # Утилиты (файловые операции, форматирование)
├── logger.api.ts               # Preload API для renderer процесса
└── logger.ipc.ts               # IPC handlers для main процесса