# 📁 Финальная структура Electron части

src/
├── electron/
│   ├── main.ts                          # ✅ Точка входа
│   │
│   ├── core/
│   │   ├── env.ts                       # ✅ Env config
│   │   ├── state.ts                     # ✅ Global state
│   │   ├── preload.ts                   # ✅ Preload script
│   │   ├── register-ipc.ts              # ✅ IPC registration
│   │   │
│   │   ├── bootstrap/
│   │   │   ├── init-database.ts         # ✅ DB initialization
│   │   │   ├── init-storage.ts          # ✅ Storage initialization
│   │   │   └── log-env.ts               # ✅ Env logging
│   │   │
│   │   └── app/
│   │       ├── create-window.ts         # ✅ Window creation
│   │       ├── get-app-url.ts           # ✅ URL resolver
│   │       └── cleanup.ts               # ✅ App cleanup
│   │
│   └── features/
│       ├── logger/                      # ✅ Logger module
│       │   ├── index.ts
│       │   ├── logger.ts
│       │   ├── logger.types.ts
│       │   ├── logger.constants.ts
│       │   ├── logger.utils.ts
│       │   ├── logger.api.ts
│       │   └── logger.ipc.ts
│       │
│       ├── app-data/                    # ✅ App-Data module
│       │   ├── index.ts
│       │   ├── app-data.ts
│       │   ├── app-data.types.ts
│       │   ├── app-data.constants.ts
│       │   ├── app-data.api.ts
│       │   └── app-data.ipc.ts
│       │
│       ├── database/                    # ✅ Database module
│       │   ├── index.ts
│       │   ├── database.ts
│       │   ├── database.types.ts
│       │   ├── database.constants.ts
│       │   ├── database.utils.ts
│       │   ├── database.config.ts
│       │   ├── database.api.ts
│       │   ├── database.ipc.ts
│       │   │
│       │   ├── migrations/
│       │   │   ├── logs.sql
│       │   │   └── schema.sql
│       │   │
│       │   └── services/
│       │       ├── sensor-data.service.ts  # ✅
│       │       └── logs.service.ts         # ✅
│       │
│       └── serial/                      # TODO: следующий рефакторинг
│           └── ...
│
└── shared/
    ├── types/
    │   ├── logs.types.ts                # ✅
    │   ├── app-data.types.ts            # ✅
    │   ├── database.types.ts            # ✅
    │   ├── error.types.ts               # ✅
    │   └── window.d.ts                  # ✅
    │
    └── errors/
        ├── index.ts                     # ✅
        ├── error-codes.ts               # ✅
        ├── error-factory.ts             # ✅
        └── error-guards.ts              # ✅
