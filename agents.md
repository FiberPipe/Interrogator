# Interrogator — Архитектурная схема проекта

## Что это

Десктопное приложение (Electron) для **сбора и визуализации данных с аппаратных датчиков в реальном времени**.

- Подключается к оборудованию через Serial Port
- Считывает данные с 16 каналов датчиков (мощность, длина волны, температура, смещение)
- Хранит данные в локальной SQLite БД
- Отображает графики в реальном времени
- Поддерживает 3 языка: EN / RU / ZH

---

## Стек

| Слой | Технологии |
|------|-----------|
| UI | React 19, TypeScript, Tailwind CSS, HeroUI, Framer Motion |
| Графики | Recharts |
| Десктоп | Electron 39 |
| База данных | sql.js (SQLite в памяти) |
| Сборка | Rsbuild (RSPack), Electron Builder |
| Коммуникация с железом | SerialPort 13 |
| Алгоритмы обработки | Python (COG LUT, InterrogatorStream) |
| i18n | i18next |

---

## Общая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        ELECTRON DESKTOP APP                      │
│                                                                   │
│  ┌─────────────────────────────┐   ┌──────────────────────────┐ │
│  │    RENDERER PROCESS         │   │    MAIN PROCESS           │ │
│  │    (React / Browser)        │   │    (Node.js)              │ │
│  │                             │   │                           │ │
│  │  ┌──────────────────────┐   │   │  ┌────────────────────┐  │ │
│  │  │    Pages             │   │   │  │  Serial Manager    │  │ │
│  │  │  • Settings          │   │   │  │  • connection      │  │ │
│  │  │  • Charts            │◄──┼───┼──│  • port-manager    │  │ │
│  │  │  • Logs              │   │   │  │  • data-processor  │  │ │
│  │  │  • Onboarding        │   │   │  │  • python-bridge   │  │ │
│  │  └──────────┬───────────┘   │   │  └────────┬───────────┘  │ │
│  │             │               │   │           │               │ │
│  │  ┌──────────▼───────────┐   │   │  ┌────────▼───────────┐  │ │
│  │  │    Widgets           │   │   │  │  Database (sql.js) │  │ │
│  │  │  • MonitoringDashboard│  │   │  │  • sensor_data     │  │ │
│  │  │  • SensorConfig      │   │   │  │  • channel_data    │  │ │
│  │  │  • SerialPort UI     │   │   │  │  • sessions        │  │ │
│  │  │  • Sidebar           │   │   │  │  • logs            │  │ │
│  │  └──────────┬───────────┘   │   │  └────────┬───────────┘  │ │
│  │             │               │   │           │               │ │
│  │  ┌──────────▼───────────┐   │   │  ┌────────▼───────────┐  │ │
│  │  │    Features (FSD)    │   │   │  │  Logger            │  │ │
│  │  │  • serial-connection │   │   │  │  App Data Store    │  │ │
│  │  │  • sensor-calibration│   │   │  │  (electron-store)  │  │ │
│  │  │  • *-monitoring      │   │   │  └────────────────────┘  │ │
│  │  │  • database-export   │   │   │                           │ │
│  │  └──────────┬───────────┘   │   └───────────┬──────────────┘ │
│  │             │               │               │                │ │
│  │  ┌──────────▼───────────┐   │   ┌───────────▼──────────────┐ │
│  │  │  Shared API Bridges  │◄──┼──►│      IPC Handlers        │ │
│  │  │  window.electron.*   │   │   │  serial.ipc.ts           │ │
│  │  │  • serial.api.ts     │   │   │  database.ipc.ts         │ │
│  │  │  • database.api.ts   │   │   │  logger.ipc.ts           │ │
│  │  │  • logger.api.ts     │   │   │  app-data.ipc.ts         │ │
│  │  │  • app-data.api.ts   │   │   └──────────────────────────┘ │
│  │  └──────────────────────┘   │                                │ │
│  └─────────────────────────────┘                                │ │
└─────────────────────────────────────────────────────────────────┘
         ▲
         │ USB / Serial
         ▼
┌─────────────────────┐     ┌──────────────────────────────────┐
│   HARDWARE          │     │   PYTHON PROCESS (subprocess)    │
│   (Interrogator     │     │                                  │
│    device)          │     │  cog_lut_demod.py                │
│                     │     │  interrogatorstream              │
│  16 channels:       │     │                                  │
│  • Power (мВт)      │     │  Алгоритмы демодуляции сигнала   │
│  • Wavelength (нм)  │     │  → JSON output → data-processor  │
│  • Temperature (°C) │     │                                  │
│  • Displacement     │     └──────────────────────────────────┘
└─────────────────────┘
```

---

## Поток данных: Serial → БД → UI

```
HARDWARE
   │ raw bytes (JSON)
   ▼
connection.service.ts          ← управляет жизненным циклом порта
   │
   ▼
data-processor.service.ts      ← разбирает пакет, применяет калибровку
   │
   ├──► python-bridge.service.ts  (опционально: COG / InterrogatorStream)
   │         │ subprocess stdout JSON
   │         ▼
   │    демодулированные значения
   │
   ▼
sensor-data.service.ts         ← сохраняет в SQLite
   │
   ▼
database.ipc.ts  ←──── IPC ────► database.api.ts
                                        │
                                 useSerialData hook
                                        │
                                 MonitoringDashboard
                                        │
                                   Recharts Graph
```

---

## Структура исходного кода (Feature-Sliced Design)

```
src/
├── app/                   # Точка входа React, роутер, провайдеры
│   ├── App.tsx
│   ├── providers/
│   │   ├── SerialPortProvider   ← глобальный стейт соединения
│   │   └── router/              ← маршруты
│   └── hooks/
│
├── pages/                 # Страницы-контейнеры
│   ├── Settings.tsx       ← основная конфигурация
│   ├── Charts.tsx         ← просмотр графиков в реальном времени
│   ├── Logs.tsx           ← журнал приложения
│   └── Onboarding.tsx     ← мастер первоначальной настройки
│
├── widgets/               # Составные компоненты
│   ├── monitoring-dashboard/    ← графики реального времени
│   ├── sensor-config/           ← настройка датчиков
│   ├── serial-port/             ← выбор и подключение порта
│   ├── sidebar/                 ← навигация
│   └── logs/                    ← список записей журнала
│
├── features/              # Функциональные модули (FSD)
│   ├── serial-connection/
│   ├── sensor-calibration/
│   ├── sensor-configuration/
│   ├── temperature-monitoring/
│   ├── power-monitoring/
│   ├── wavelength-monitoring/
│   ├── displacement-monitoring/
│   ├── data-visualization/
│   ├── database-export/
│   └── reset/
│
├── entities/              # Типы данных и модели
│   ├── sensor-data/
│   ├── power-data/
│   ├── temperature/
│   ├── displacement/
│   ├── sensor/
│   └── chart/
│
├── shared/                # Переиспользуемый код
│   ├── api/               ← IPC-мосты (window.electron.*)
│   ├── types/             ← TypeScript определения
│   ├── i18n/              ← локализации EN/RU/ZH
│   ├── errors/            ← фабрика ошибок
│   ├── ui/                ← базовые UI-компоненты
│   └── lib/               ← утилиты
│
└── electron/              # Main process (Node.js)
    ├── main.ts            ← точка входа Electron
    ├── core/
    │   ├── bootstrap/     ← инициализация БД, хранилища
    │   ├── app/           ← создание окна, cleanup
    │   ├── preload.ts     ← экспонирует API в renderer
    │   └── register-ipc.ts
    └── features/
        ├── serial/        ← работа с портом, парсинг, Python
        ├── database/      ← SQLite через sql.js
        ├── logger/        ← логирование
        └── app-data/      ← настройки (electron-store)
```

---

## Схема базы данных

```
sensor_data                    channel_data
┌──────────────┐               ┌──────────────────┐
│ id           │──────────────►│ sensor_data_id   │
│ record_id    │               │ channel (0–15)   │
│ timestamp    │               │ value            │
│ time         │               │ std_dev          │
│ port         │               │ timestamp        │
│ raw_data     │               └──────────────────┘
│ created_at   │
└──────────────┘

sessions                       logs
┌──────────────┐               ┌──────────────────┐
│ id           │               │ id               │
│ port         │               │ level            │
│ start_time   │               │ module           │
│ end_time     │               │ message          │
│ record_count │               │ timestamp        │
│ status       │               │ metadata (JSON)  │
└──────────────┘               └──────────────────┘
```

---

## IPC-интерфейс (Renderer ↔ Main)

```
window.electron
├── serial
│   ├── getPorts()               → ComPort[]
│   ├── connect(port, config)    → void
│   ├── disconnect()             → void
│   ├── onData(callback)         → unsubscribe fn
│   └── onError(callback)        → unsubscribe fn
│
├── database
│   ├── getSensorData(query)     → SensorData[]
│   ├── getChannelData(query)    → ChannelData[]
│   ├── getSessions()            → Session[]
│   ├── exportData(format)       → void
│   └── getDatabaseInfo()        → DbInfo
│
├── logger
│   ├── getLogs(filter)          → LogEntry[]
│   └── clearLogs()              → void
│
└── appData
    ├── get(key)                 → any
    └── set(key, value)          → void
```

---

## Алгоритмы демодуляции (Python)

```
python-bridge.service.ts
   │
   ├── COG LUT (Center of Gravity Lookup Table)
   │       src/electron/features/serial/shared/demodulation_methods/cog/
   │       └── cog_lut_demod.py
   │             • Модели: pre-trained LUT файлы
   │             • Ноутбуки: исследование алгоритма
   │             • Отчёты: результаты валидации
   │
   └── InterrogatorStream
           src/electron/features/serial/shared/demodulation_methods/interrogatorstream/
                 • Альтернативный метод демодуляции
```

---

## Скрипты сборки

```
package.json scripts
├── dev:electron     → Rsbuild + Electron с hot-reload
├── dev:web          → только веб (порт 3000)
├── build            → полная сборка + NSIS-инсталлятор (Windows)
├── build:web        → только веб-бандл
└── build:electron   → только Electron

scripts/
├── build.js              ← оркестратор сборки
├── prebuild.js           ← предварительные задачи
├── prepare-build.js      ← подготовка
├── version-manager.js    ← управление версиями
├── create-icons.js       ← генерация иконок
├── check-assets.js       ← валидация ресурсов
└── check-i18n.js         ← проверка переводов
```

---

## Ключевые паттерны

| Паттерн | Где применяется |
|---------|----------------|
| Feature-Sliced Design | `src/features/`, `src/widgets/`, `src/entities/`, `src/shared/` |
| Singleton | `database.ts`, `logger.ts` в main process |
| IPC Bridge | `preload.ts` → `window.electron.*` → `*.ipc.ts` |
| Context API | `SerialPortProvider` — глобальный стейт соединения |
| Custom Hooks | `useSerialData`, `useComPort`, `useOnboarding` |
| Service Classes | `DataProcessorService`, `SensorDataService`, `PythonBridgeService` |
