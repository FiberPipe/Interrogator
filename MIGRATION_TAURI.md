# План миграции Electron → Tauri

## Почему Tauri

| Метрика | Electron | Tauri |
|---------|---------|-------|
| Размер инсталлятора | ~500 МБ | ~10–20 МБ |
| Потребление RAM | ~200–400 МБ | ~30–100 МБ |
| Бандлит браузер | Да (Chromium) | Нет (системный WebView) |
| Backend язык | Node.js | Rust |
| Безопасность | contextBridge + preload | встроена в архитектуру |

**Frontend (весь React-код) остаётся без изменений.**  
Мигрируется только `src/electron/` → Rust.

---

## Что меняется, что остаётся

```
ОСТАЁТСЯ (не трогаем)          МЕНЯЕТСЯ
──────────────────────         ──────────────────────────────────
src/app/                       src/electron/  →  src-tauri/src/
src/pages/                     preload.ts     →  удаляется
src/widgets/                   electron-store →  tauri-plugin-store
src/features/                  sql.js         →  tauri-plugin-sql
src/entities/                  serialport npm →  tauri-plugin-serialport
src/shared/i18n/               child_process  →  tauri-plugin-shell
src/shared/errors/             ipcMain/ipcRenderer → tauri commands + events
src/shared/ui/                 window.electron.*  → invoke() + listen()
src/shared/lib/
Python scripts (без изменений)
```

---

## Карта замен API

| Electron | Tauri |
|----------|-------|
| `ipcMain.handle()` | `#[tauri::command]` в Rust |
| `ipcRenderer.invoke()` | `invoke()` из `@tauri-apps/api/core` |
| `ipcRenderer.on()` | `listen()` из `@tauri-apps/api/event` |
| `webContents.send()` | `app_handle.emit()` в Rust |
| `contextBridge.exposeInMainWorld` | не нужен |
| `preload.ts` | удаляется |
| `dialog.showOpenDialog()` | `open()` из `@tauri-apps/plugin-dialog` |
| `dialog.showSaveDialog()` | `save()` из `@tauri-apps/plugin-dialog` |
| `shell.openPath()` | `openPath()` из `@tauri-apps/plugin-opener` |
| `electron-store` | `@tauri-apps/plugin-store` |
| `sql.js` | `@tauri-apps/plugin-sql` (SQLite через sqlx) |
| `serialport` npm | `tauri-plugin-serialport` |
| `child_process.spawn()` | `tauri-plugin-shell` sidecar |
| `app.getPath('userData')` | `app_handle.path().app_data_dir()` |
| `BrowserWindow` | `tauri.conf.json` → `windows[]` |
| `electron-builder` | `tauri build` |

---

## Tauri-плагины

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri            = { version = "2", features = ["protocol-asset"] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-store       = "2"
tauri-plugin-serialport  = "2"   # community plugin
tauri-plugin-dialog      = "2"
tauri-plugin-shell       = "2"
tauri-plugin-fs          = "2"
tauri-plugin-opener      = "2"
serde      = { version = "1", features = ["derive"] }
serde_json = "1"
tokio      = { version = "1", features = ["full"] }
```

---

## Фазы миграции

### Фаза 0 — Подготовка окружения `(2–3 дня)`

**Цель:** проект запускается в Tauri, показывает заглушку "Hello Tauri"

```bash
# 1. Установить Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add x86_64-pc-windows-msvc   # для Windows сборки

# 2. Установить Tauri CLI
cargo install tauri-cli --version "^2"
# или через npm:
pnpm add -D @tauri-apps/cli

# 3. Инициализировать Tauri поверх существующего проекта
pnpm tauri init
# Ответить:
#   App name: Interrogator
#   Window title: Interrogator
#   Web assets: ../build/renderer
#   Dev URL: http://localhost:3000
#   devCommand: pnpm dev:react
#   buildCommand: pnpm build:web
```

**Что появится:**
```
src-tauri/
├── Cargo.toml
├── Cargo.lock
├── tauri.conf.json
├── build.rs
├── icons/          ← иконки из assets/
└── src/
    ├── main.rs
    └── lib.rs
```

**Настроить `tauri.conf.json`:**
```json
{
  "productName": "Interrogator",
  "version": "1.1.0-beta.1",
  "identifier": "com.interrogator.app",
  "build": {
    "frontendDist": "../build/renderer",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "pnpm dev:react",
    "beforeBuildCommand": "pnpm build:web"
  },
  "app": {
    "windows": [{
      "title": "Interrogator",
      "width": 1280,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600
    }],
    "security": { "csp": null }
  },
  "bundle": {
    "active": true,
    "targets": "nsis",
    "icon": ["icons/icon.ico", "icons/icon.png"]
  }
}
```

**Обновить `package.json` scripts:**
```json
"dev:tauri": "pnpm tauri dev",
"build:tauri": "pnpm tauri build",
"build:tauri:debug": "pnpm tauri build --debug"
```

**Удалить зависимости Electron:**
```bash
pnpm remove electron electron-builder electron-store concurrently wait-on
```

**Контрольная точка:** `pnpm dev:tauri` → открывается окно с React-приложением.

---

### Фаза 1 — App Data `(1–2 дня)`

**Цель:** настройки сохраняются и читаются через Tauri Store

**Что заменяем:** `src/electron/features/app-data/` + `electron-store`

```bash
pnpm add @tauri-apps/plugin-store
cargo add tauri-plugin-store
```

**`src-tauri/src/lib.rs`** — подключить плагин:
```rust
tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    // ... остальные плагины
```

**`src/shared/api/app-data.api.ts`** — переписать:
```typescript
// БЫЛО: window.electron.appData.get(key)
// СТАЛО:
import { load } from '@tauri-apps/plugin-store'

const getStore = async () => load('app-data.json', { autoSave: true })

export const appDataApi = {
  getAll: async () => (await getStore()).entries().then(Object.fromEntries),
  get: async <T>(key: string): Promise<T | undefined> => (await getStore()).get(key),
  set: async (key: string, value: unknown) => (await getStore()).set(key, value),
  delete: async (key: string) => (await getStore()).delete(key),
  patch: async (patch: Record<string, unknown>) => {
    const store = await getStore()
    for (const [k, v] of Object.entries(patch)) await store.set(k, v)
  },
  clear: async () => (await getStore()).clear(),
  has: async (key: string): Promise<boolean> => (await getStore()).has(key),
}
```

**Что удаляется:**
- `src/electron/features/app-data/` — весь каталог
- `app-data.types.ts` — AppDataIPC enum
- Секция в `register-ipc.ts`

**Контрольная точка:** настройки сохраняются после перезапуска.

---

### Фаза 2 — Logger `(2–3 дня)`

**Цель:** логи пишутся в файл и читаются из UI

**Что заменяем:** `src/electron/features/logger/`

```bash
pnpm add @tauri-apps/plugin-fs @tauri-apps/plugin-dialog
cargo add tauri-plugin-fs tauri-plugin-dialog
```

**Rust-команды в `src-tauri/src/commands/logger.rs`:**
```rust
use tauri::AppHandle;
use tauri_plugin_fs::FsExt;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct LogEntry {
    pub id: i64,
    pub level: String,
    pub module: String,
    pub message: String,
    pub timestamp: String,
    pub metadata: Option<serde_json::Value>,
}

#[tauri::command]
pub async fn logs_get(filter: Option<LogFilter>, app: AppHandle) -> Result<Vec<LogEntry>, String> {
    // читать из SQLite таблицы logs
}

#[tauri::command]
pub async fn logs_send(level: String, module: String, message: String, app: AppHandle) {
    // писать в SQLite + emit событие если нужно
}

#[tauri::command]
pub async fn logs_clear(app: AppHandle) -> Result<(), String> { ... }

#[tauri::command]
pub async fn logs_export(app: AppHandle) -> Result<ExportResult, String> {
    // таури диалог сохранения + запись файла
}
```

**`src/shared/api/logger.api.ts`** — переписать:
```typescript
// БЫЛО: window.electron.logs.get(filter)
// СТАЛО:
import { invoke } from '@tauri-apps/api/core'

export const loggerApi = {
  get: (filter?: LogFilter) => invoke<LogEntry[]>('logs_get', { filter }),
  getStats: () => invoke<LogsStats>('logs_get_stats'),
  cleanup: () => invoke<CleanupResult>('logs_cleanup'),
  clear: () => invoke<void>('logs_clear'),
  export: () => invoke<ExportResult>('logs_export'),
  sendDebug: (area: string, message: string, meta?: unknown) =>
    invoke<void>('logs_send', { level: 'debug', module: area, message, metadata: meta }),
  sendInfo: (area: string, message: string, meta?: unknown) =>
    invoke<void>('logs_send', { level: 'info', module: area, message, metadata: meta }),
  sendWarn: (area: string, message: string, meta?: unknown) =>
    invoke<void>('logs_send', { level: 'warn', module: area, message, metadata: meta }),
  sendError: (area: string, message: string, meta?: unknown) =>
    invoke<void>('logs_send', { level: 'error', module: area, message, metadata: meta }),
}
```

**Что удаляется:** `src/electron/features/logger/` — весь каталог

---

### Фаза 3 — Database `(3–4 дня)`

**Цель:** SQLite работает через Tauri, все запросы идут из Rust

**Что заменяем:** `src/electron/features/database/` + `sql.js`

```bash
pnpm add @tauri-apps/plugin-sql
cargo add tauri-plugin-sql --features sqlite
```

**Инициализация в `lib.rs`:**
```rust
.plugin(tauri_plugin_sql::Builder::new()
    .add_migrations("sqlite:sensor-data.db", migrations())
    .build())
```

**Схема БД (миграции) в `src-tauri/src/migrations.rs`:**
```rust
use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        kind: MigrationKind::Up,
        sql: r#"
            CREATE TABLE IF NOT EXISTS sensor_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER,
                timestamp TEXT,
                time REAL,
                port TEXT,
                raw_data TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS channel_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sensor_data_id INTEGER REFERENCES sensor_data(id),
                channel INTEGER,
                value REAL,
                std_dev REAL,
                timestamp TEXT
            );
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                port TEXT,
                start_time TEXT,
                end_time TEXT,
                record_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active'
            );
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level TEXT,
                module TEXT,
                message TEXT,
                timestamp TEXT DEFAULT (datetime('now')),
                metadata TEXT
            );
            PRAGMA journal_mode=MEMORY;
            PRAGMA synchronous=OFF;
            PRAGMA cache_size=10000;
        "#,
    }]
}
```

**Rust-команды в `src-tauri/src/commands/database.rs`:**
```rust
#[tauri::command]
pub async fn db_get_last_records(
    port: String,
    limit: Option<i64>,
    db: tauri::State<'_, DatabaseState>,
) -> Result<Vec<SensorDataRecord>, String> { ... }

#[tauri::command]
pub async fn db_get_channel_stats(...) -> Result<ChannelStats, String> { ... }

#[tauri::command]
pub async fn db_get_stats(db: tauri::State<'_, DatabaseState>) -> Result<DatabaseStats, String> { ... }

#[tauri::command]
pub async fn db_change_location(location: String, app: AppHandle) -> Result<(), String> { ... }

#[tauri::command]
pub async fn db_create_backup(app: AppHandle) -> Result<BackupResult, String> {
    // dialog::save + fs::copy
}

#[tauri::command]
pub async fn db_export_data(options: ExportOptions, app: AppHandle) -> Result<ExportResult, String> { ... }

#[tauri::command]
pub async fn db_clear(db: tauri::State<'_, DatabaseState>) -> Result<(), String> { ... }
```

**`src/shared/api/database.api.ts`** — переписать:
```typescript
// БЫЛО: window.electron.database.getLastRecords(port, limit)
// СТАЛО:
import { invoke } from '@tauri-apps/api/core'

export const databaseApi = {
  getPath: () => invoke<DatabasePathInfo>('db_get_path'),
  changeLocation: (location: string, customPath?: string) =>
    invoke<void>('db_change_location', { location, customPath }),
  selectCustomPath: () => invoke<string | null>('db_select_custom_path'),
  openFolder: () => invoke<void>('db_open_folder'),
  getStats: () => invoke<DatabaseStats>('db_get_stats'),
  getChannelStats: (port: string, channel: number, startTime: string, endTime: string) =>
    invoke<ChannelStats>('db_get_channel_stats', { port, channel, startTime, endTime }),
  getDataByTimeRange: (port: string, startTime: string, endTime: string, limit?: number) =>
    invoke<SensorDataRecord[]>('db_get_data_by_time_range', { port, startTime, endTime, limit }),
  getLastRecords: (port: string, limit?: number) =>
    invoke<SensorDataRecord[]>('db_get_last_records', { port, limit }),
  createBackup: () => invoke<BackupResult>('db_create_backup'),
  restoreBackup: () => invoke<BackupResult>('db_restore_backup'),
  exportData: (options: ExportOptions) => invoke<ExportResult>('db_export_data', { options }),
  vacuum: () => invoke<void>('db_vacuum'),
  clear: () => invoke<void>('db_clear'),
}
```

**Что удаляется:** `src/electron/features/database/` — весь каталог, `sql.js` из зависимостей

---

### Фаза 4 — Python Bridge `(1–2 дня)`

**Цель:** Python-скрипты запускаются как Tauri sidecar

**Что заменяем:** `python-bridge.service.ts` (`child_process.spawn`)

```bash
cargo add tauri-plugin-shell
```

**`tauri.conf.json`** — объявить sidecar:
```json
{
  "bundle": {
    "externalBin": [
      "binaries/interrogator"
    ]
  },
  "plugins": {
    "shell": {
      "sidecar": true,
      "scope": [
        {
          "name": "binaries/interrogator",
          "sidecar": true,
          "args": true
        }
      ]
    }
  }
}
```

**Python-скрипты** упаковать в `src-tauri/binaries/interrogator` (или использовать PyInstaller):
```bash
# Создать standalone executable из interrogator_stdout.py
pyinstaller --onefile --name interrogator interrogator_stdout.py
cp dist/interrogator src-tauri/binaries/interrogator-x86_64-pc-windows-msvc.exe
```

**Rust-сервис `src-tauri/src/services/python_bridge.rs`:**
```rust
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

pub struct PythonBridge {
    child: Option<tauri_plugin_shell::process::CommandChild>,
}

impl PythonBridge {
    pub async fn start(
        &mut self,
        app: &AppHandle,
        port: String,
        baud: u32,
        on_data: impl Fn(String) + Send + 'static,
    ) -> Result<(), String> {
        let (mut rx, child) = app
            .shell()
            .sidecar("interrogator")
            .map_err(|e| e.to_string())?
            .args([&port, &baud.to_string()])
            .spawn()
            .map_err(|e| e.to_string())?;

        self.child = Some(child);

        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                if let CommandEvent::Stdout(line) = event {
                    if let Ok(s) = String::from_utf8(line) {
                        on_data(s);
                    }
                }
            }
        });
        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(child) = self.child.take() {
            let _ = child.kill();
        }
    }
}
```

**Что удаляется:** `src/electron/features/serial/services/python-bridge.service.ts`  
**Python-скрипты** остаются без изменений, только упаковываются через PyInstaller.

---

### Фаза 5 — Serial Port `(4–5 дней)` ← самая сложная

**Цель:** подключение к реальному порту, стриминг данных в React через события

**Что заменяем:** всё `src/electron/features/serial/`

```bash
cargo add tauri-plugin-serialport
# Rust crates:
cargo add serialport tokio tokio-util futures-util
```

**Архитектура в Rust:**

```
src-tauri/src/
├── commands/
│   └── serial.rs        ← get_ports, open_port, close_port
├── services/
│   ├── serial_manager.rs     ← SerialManager (singleton через tauri::State)
│   ├── connection.rs         ← открыть/закрыть порт, автоподключение
│   ├── port_manager.rs       ← активные порты, Python bridge
│   ├── data_processor.rs     ← парсинг JSON, калибровка, запись в БД
│   └── mock_port.rs          ← моковые данные для разработки
└── state.rs             ← AppState (SerialManager + Database)
```

**Rust State в `lib.rs`:**
```rust
use std::sync::Mutex;

pub struct AppState {
    pub serial: Mutex<SerialManager>,
    pub db: Mutex<Database>,
}

tauri::Builder::default()
    .manage(AppState {
        serial: Mutex::new(SerialManager::new()),
        db: Mutex::new(Database::new()),
    })
```

**Rust-команды `src-tauri/src/commands/serial.rs`:**
```rust
#[tauri::command]
pub async fn serial_get_ports(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<SerialPortInfo>, String> {
    serialport::available_ports()
        .map_err(|e| e.to_string())
        .map(|ports| ports.into_iter().map(Into::into).collect())
}

#[tauri::command]
pub async fn serial_open(
    path: String,
    baud_rate: Option<u32>,
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<SerialOpenResult, String> {
    state.serial.lock().unwrap()
        .open_port(path, baud_rate.unwrap_or(500_000), app)
        .await
}

#[tauri::command]
pub async fn serial_close(
    path: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    state.serial.lock().unwrap().close_port(path).await
}
```

**Стриминг данных — через Tauri события:**
```rust
// Rust сторона (data_processor.rs) → emit событие
app.emit("serial:data", &parsed_data).unwrap();
app.emit("serial:error", &error_msg).unwrap();
app.emit("serial:closed", &port_path).unwrap();
```

**`src/shared/api/serial.api.ts`** — переписать:
```typescript
// БЫЛО: window.electron.serial.getPorts()
// СТАЛО:
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export const serialApi = {
  getPorts: () => invoke<SerialPortInfo[]>('serial_get_ports'),
  open: (path: string, baudRate?: number) =>
    invoke<SerialOpenResult>('serial_open', { path, baudRate }),
  close: (path: string) => invoke<void>('serial_close', { path }),

  // События — listen() возвращает Promise<UnlistenFn>
  onData: (callback: (data: SensorData) => void) =>
    listen<SensorData>('serial:data', e => callback(e.payload)),
  onClosed: (callback: (path: string) => void) =>
    listen<string>('serial:closed', e => callback(e.payload)),
  onError: (callback: (err: string) => void) =>
    listen<string>('serial:error', e => callback(e.payload)),
  onAutoConnected: (callback: (path: string) => void) =>
    listen<string>('serial:auto-connected', e => callback(e.payload)),
  onAutoConnectNone: (callback: () => void) =>
    listen('serial:auto-connect-none', () => callback()),
  onAutoConnectFailed: (callback: (path: string) => void) =>
    listen<string>('serial:auto-connect-failed', e => callback(e.payload)),
}
```

**Важно: изменение сигнатуры `onData` и подобных.**  
В Electron они возвращали синхронный `unsubscribe`. В Tauri — `Promise<UnlistenFn>`.  
Нужно обновить `SerialPortProvider.tsx` и все хуки, где используется подписка:

```typescript
// БЫЛО:
useEffect(() => {
  const unsub = window.electron.serial.onData(handler)
  return () => unsub()
}, [])

// СТАЛО:
useEffect(() => {
  let unlisten: (() => void) | undefined
  serialApi.onData(handler).then(fn => { unlisten = fn })
  return () => unlisten?.()
}, [])
```

**Что удаляется:** `src/electron/features/serial/` — весь каталог, `serialport` npm-пакет

---

### Фаза 6 — Сборка и упаковка `(1–2 дня)`

**Цель:** `pnpm build:tauri` → `dist/` с NSIS инсталлятором < 20 МБ

**`tauri.conf.json`** — настроить bundle:
```json
{
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "identifier": "com.interrogator.app",
    "publisher": "Interrogator Team",
    "icon": ["icons/icon.ico", "icons/32x32.png", "icons/128x128.png"],
    "windows": {
      "digestAlgorithm": "sha256",
      "certificateThumbprint": null,
      "timestampUrl": ""
    },
    "nsis": {
      "displayLanguageSelector": false,
      "languages": ["English", "Russian"],
      "installMode": "currentUser"
    },
    "externalBin": ["binaries/interrogator"]
  }
}
```

**Обновить `scripts/build.js`** — заменить вызов electron-builder на:
```bash
pnpm tauri build --target x86_64-pc-windows-msvc
```

**Управление версиями** — `version.config.json` → синхронизировать с `tauri.conf.json`:
```js
// scripts/version-manager.js — добавить sync для tauri.conf.json
const tauriConf = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json'))
tauriConf.version = newVersion
fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(tauriConf, null, 2))
```

---

### Фаза 7 — Очистка и типы `(1 день)`

**Что удалить:**
```bash
# npm-пакеты Electron
pnpm remove electron electron-builder electron-store serialport sql.js
pnpm remove concurrently wait-on

# Файлы
rm -rf src/electron/
rm src/shared/types/global.d.ts   # заменить на новый
```

**`src/shared/types/global.d.ts`** — новый (без `window.electron`):
```typescript
// В Tauri window.electron не нужен — всё через invoke/listen
export {}
```

**`src/shared/api/index.ts`** — убедиться что экспортирует новые API:
```typescript
export { serialApi } from './serial.api'
export { databaseApi } from './database.api'
export { loggerApi } from './logger.api'
export { appDataApi } from './app-data.api'
```

---

## Итоговые оценки трудозатрат

| Фаза | Задача | Дней |
|------|--------|------|
| 0 | Подготовка: Rust, Tauri CLI, init, конфиг | 2–3 |
| 1 | App Data → tauri-plugin-store | 1–2 |
| 2 | Logger → Rust команды | 2–3 |
| 3 | Database → tauri-plugin-sql + миграции | 3–4 |
| 4 | Python Bridge → sidecar | 1–2 |
| 5 | Serial Port → Rust сервисы + события | 4–5 |
| 6 | Сборка, упаковка, версионирование | 1–2 |
| 7 | Очистка, типы, финальное тестирование | 2–3 |
| | **Итого** | **16–24 дня** |

---

## Риски и зависимости

### Критические риски

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| `tauri-plugin-serialport` не поддерживает нужные функции | Средняя | Использовать crate `serialport` напрямую в Rust |
| Windows-специфичное поведение SerialPort в Rust | Высокая | Тестировать на Windows с реальным железом с Фазы 5 |
| PyInstaller bundling Python с зависимостями | Средняя | Альтернатива — держать Python как внешнюю зависимость |
| systemный WebView2 не установлен на старых Windows | Низкая | Tauri умеет бандлить WebView2 bootstrap installer |

### Зависимости между фазами

```
Фаза 0 (setup)
  └── Фаза 1 (app-data)     ← нужна для auth всех остальных фаз
        └── Фаза 3 (db)
              └── Фаза 2 (logger) ← логи пишутся в ту же БД
                    └── Фаза 5 (serial)  ← самая сложная, зависит от БД и логгера
                          └── Фаза 4 (python)  ← запускается из serial
                                └── Фаза 6 (build)
                                      └── Фаза 7 (cleanup)
```

---

## Что НЕ меняется (подтверждение)

- `src/app/` — роутер, провайдеры (кроме `SerialPortProvider` — async unlisten)
- `src/pages/` — все страницы
- `src/widgets/` — все виджеты
- `src/features/` — все фичи
- `src/entities/` — все типы
- `src/shared/i18n/` — локализации
- `src/shared/errors/` — фабрика ошибок
- `src/shared/ui/` — компоненты
- `src/shared/lib/` — утилиты
- Python-скрипты (`interrogator_stdout.py`, `interrogator_io.py`, `cog_lut_demod.py`)
- Rsbuild конфиг (только убрать Electron-специфичные настройки)

---

## Минимальная структура Rust после миграции

```
src-tauri/src/
├── main.rs              ← точка входа (3 строки)
├── lib.rs               ← регистрация команд, плагинов, состояния
├── state.rs             ← AppState (SerialManager, Database)
├── migrations.rs        ← SQL-схема
├── commands/
│   ├── mod.rs
│   ├── serial.rs        ← serial_get_ports, serial_open, serial_close
│   ├── database.rs      ← db_get_*, db_export, db_backup, db_clear
│   └── logger.rs        ← logs_get, logs_send, logs_clear, logs_export
└── services/
    ├── mod.rs
    ├── serial_manager.rs     ← SerialManager struct
    ├── connection.rs         ← открыть/закрыть порт
    ├── port_manager.rs       ← активные порты
    ├── data_processor.rs     ← парсинг данных, запись в БД
    ├── python_bridge.rs      ← sidecar subprocess
    └── mock_port.rs          ← мок для разработки
```
