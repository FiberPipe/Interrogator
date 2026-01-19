# FBG Interrogator App - Knowledge Base

## Обзор проекта

**Назначение:** Настольное приложение для мониторинга и анализа данных с FBG (Fiber Bragg Grating) датчиков через COM-порты.

**Технологический стек:**
- **Frontend:** React 18 + TypeScript
- **Backend:** Electron (Main Process)
- **UI Framework:** HeroUI (NextUI fork)
- **Графики:** Recharts
- **Анимации:** Framer Motion
- **Иконки:** Lucide React
- **i18n:** react-i18next
- **База данных:** SQLite3 (better-sqlite3)
- **Архитектура:** FSD (Feature-Sliced Design)
- **Build:** Electron Forge

## Архитектура

### FSD структура

src/
├── app/ # Инициализация приложения
│ ├── providers/ # Context providers
│ │ └── SerialPortProvider.tsx
│ ├── hooks/ # Глобальные хуки
│ ├── router.tsx # React Router настройка
│ └── App.tsx
│
├── pages/ # Страницы приложения
│ ├── charts/ # Страница графиков
│ ├── settings/ # Страница настроек
│ ├── onboarding/ # Онбординг
│ └── calibration/ # Калибровка
│
├── widgets/ # Сложные композитные компоненты
│ ├── monitoring-dashboard/ # Dashboard для мониторинга
│ ├── sensor-config/ # Виджет конфигурации датчиков
│ ├── serial-port/ # Виджет COM-порта
│ └── sensor-calibration/ # Виджет калибровки
│
├── features/ # Бизнес-фичи
│ ├── power-monitoring/ # Мониторинг мощности
│ ├── wavelength-monitoring/ # Мониторинг длины волны
│ ├── temperature-monitoring/ # Мониторинг температуры
│ ├── displacement-monitoring/# Мониторинг смещения
│ ├── sensor-configuration/ # Конфигурация датчиков
│ ├── data-visualization/ # Визуализация данных
│ └── alert-system/ # Система алертов (new)
│
├── entities/ # Бизнес-сущности
│ ├── sensor/ # Сущность датчика
│ ├── sensor-data/ # Данные датчиков
│ ├── chart/ # Сущность графика
│ └── alert/ # Сущность алерта (new)
│
└── shared/ # Переиспользуемый код
├── ui/ # UI компоненты
│ ├── charts/ # Графические компоненты
│ └── toaster/ # Уведомления
├── lib/ # Утилиты
└── types/ # Общие типы

shell

### Поток данных

┌─────────────┐
│ COM Port │ → Raw JSON: { id, time, P0-P15, stdDev0-15 }
└──────┬──────┘
│
▼
┌─────────────────────────────────────┐
│ SerialDataProcessor (Backend) │
│ │
│ 1. Parse JSON │
│ 2. Load calibration data │
│ 3. Normalize: P[i] - field[i] │
│ 4. Calculate wavelengths: │
│ λ = Σ(P[i]·λc[i]) / Σ(P[i]) │
│ 5. Check alert rules (new) │
└─────────┬───────────────────────────┘
│
┌─────┴─────┬──────────────┐
▼ ▼ ▼
┌────────┐ ┌─────────┐ ┌──────────┐
│ SQLite │ │ IPC │ │ Alerts │
│ DB │ │Broadcast│ │ Database │
└────────┘ └────┬────┘ └──────────┘
│
▼
┌───────────────────────────────────┐
│ useSerialData (Frontend) │
│ │
│ • Receives via IPC │
│ • Updates dataBuffer │
│ • Triggers React re-render │
└───────────┬───────────────────────┘
│
▼
┌───────────────────────────────────┐
│ MonitoringDashboard │
│ │
│ → PowerChart/Table │
│ → WavelengthChart/Table │
│ → TemperatureChart/Table (calc) │
│ → DisplacementChart/Table (calc) │
└───────────────────────────────────┘

markdown

## Ключевые концепции

### 1. Разделение вычислений

**Backend (Electron Main Process):**
- ✅ Нормализация данных (P - field)
- ✅ Расчет wavelength (weighted average)
- ✅ Сохранение в БД
- ✅ Проверка alert rules

**Frontend (React):**
- ✅ Расчет температуры (по формуле с коэффициентами)
- ✅ Расчет смещения (по формуле с коэффициентами)
- ✅ Визуализация данных
- ✅ Управление UI состоянием

**Почему так:**
- Нормализация и wavelength нужны всегда → backend
- Temperature/Displacement зависят от пользовательских коэффициентов → frontend
- Frontend может быстро пересчитывать при изменении коэффициентов

### 2. Структура данных

**Raw data (от устройства):**
```json
{
  "id": "record_62",
  "time": "00:01:37.872",
  "P0": 1.894721,
  "stdDev0": 0.021351,
  "P1": 2.001805,
  "stdDev1": 0.014994,
  ...
  "P15": 1.96986,
  "stdDev15": 0.017523
}
Processed data (после backend обработки):

json
{
  "id": "record_62",
  "time": "00:01:37.872",
  "timestamp": "14:23:45",
  "P0": 1.894721,
  "stdDev0": 0.021351,
  ...
  "normalized": {
    "P0": 1.85,
    "P1": 1.92,
    ...
  },
  "wavelengths": {
    "wavelength0": 1550.234,
    "wavelength1": 1551.456,
    ...
  }
}
3. База данных SQLite
Таблицы:

sql
-- Сессии записи
sensor_sessions (
  id INTEGER PRIMARY KEY,
  port TEXT,
  start_time DATETIME,
  end_time DATETIME,
  record_count INTEGER
)

-- Основные данные
sensor_data (
  id INTEGER PRIMARY KEY,
  session_id INTEGER,
  port TEXT,
  record_id TEXT,
  time TEXT,
  timestamp INTEGER,
  raw_data TEXT -- JSON с полными данными
)

-- Данные по каналам
sensor_channels (
  id INTEGER PRIMARY KEY,
  data_id INTEGER,
  channel INTEGER,
  value REAL,
  normalized REAL,
  std_dev REAL
)

-- Индексы для быстрого поиска
CREATE INDEX idx_data_time ON sensor_data(timestamp);
CREATE INDEX idx_channels_data ON sensor_channels(data_id);
4. IPC Communication
Каналы:

typescript
// Electron Main → Renderer
'serial:data'    // Новые данные
'serial:closed'  // Порт закрыт
'serial:error'   // Ошибка порта

// Renderer → Electron Main
'serial:getPorts'  // Получить список портов
'serial:open'      // Открыть порт
'serial:close'     // Закрыть порт

'app-data:get-all' // Получить все настройки
'app-data:set'     // Сохранить настройку
'app-data:patch'   // Обновить несколько настроек

'db:getStats'      // Статистика БД
'db:getPath'       // Путь к БД
5. Context Providers
SerialPortContext:

Глобальное состояние подключения к портам
Единственный экземпляр useComPort
Доступен везде через useSerialPortContext()
Сохраняет состояние между переходами по страницам
6. Формулы расчетов
Temperature (FBG датчик):

scss
T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A
Displacement (FBG датчик деформации):

scss
ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)
Wavelength (weighted average):

css
λ = Σ(P[i] · λc[i]) / Σ(P[i])
Конфигурация датчиков
Структура конфигурации
typescript
interface SensorConfig {
  index: number;          // 0-7
  type: SensorType;       // 'displacement' | 'temperature' | 'pressure' | 'strain' | 'vibration'
  channels: string[];     // ['P0', 'P1', 'P2', 'P3'] - до 4 каналов
  alias?: string;         // Пользовательское имя
}
Правила:

Максимум 8 датчиков
Каждый датчик использует до 4 каналов
Каналы не могут пересекаться между датчиками
Минимум 2 канала для расчета wavelength
Калибровка
Нормализация (field0-15):

Вычитается из raw значения P[i]
Убирает базовую составляющую сигнала
Хранится в calibrationData.normalization
Центральные длины волн (lambdas_central0-15):

Эталонные значения для каждого канала
Используются для weighted average
Хранится в calibrationData.wavelengths
Типовые паттерны
1. Feature структура
typescript
features/
  feature-name/
    model/
      types.ts           # Типы
      useFeature.ts      # Основной хук
      utils.ts           # Утилиты
    ui/
      FeatureComponent.tsx  # UI компоненты
      FeatureForm.tsx
    lib/
      feature-service.ts    # Бизнес-логика
    index.ts            # Экспорты
2. Хук с сохранением данных
typescript
const useFeature = () => {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка из appData
  useEffect(() => {
    const load = async () => {
      const data = await window.appData.getAll();
      if (data?.featureKey) {
        setState(data.featureKey);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Сохранение
  const save = useCallback(async (newState) => {
    setState(newState);
    await window.appData.set('featureKey', newState);
  }, []);

  return { state, isLoading, save };
};
3. IPC Handler (Electron)
typescript
// Main process
ipcMain.handle('channel:action', async (event, ...args) => {
  try {
    console.log('[IPC] Handler called:', args);
    
    // Выполнение действия
    const result = await doSomething(args);
    
    // Уведомление renderer
    win.webContents.send('channel:event', result);
    
    return { ok: true, data: result };
  } catch (err) {
    console.error('[IPC] Error:', err);
    return { error: String(err) };
  }
});

// Renderer
window.api = {
  action: (...args) => ipcRenderer.invoke('channel:action', ...args),
  onEvent: (cb) => {
    const handler = (_, data) => cb(data);
    ipcRenderer.on('channel:event', handler);
    return () => ipcRenderer.removeListener('channel:event', handler);
  }
};
4. Компонент с мониторингом
typescript
const MonitoringComponent = () => {
  const { connectedPort } = useSerialPortContext();
  const { dataBuffer, latestData, isReceiving } = useSerialData(connectedPort);

  const processedData = useMemo(() => {
    return dataBuffer.map(point => ({
      ...point,
      calculated: someCalculation(point)
    }));
  }, [dataBuffer]);

  return (
    <Card>
      <CardHeader>
        {isReceiving && <Chip color="success">LIVE</Chip>}
      </CardHeader>
      <CardBody>
        <Chart data={processedData} />
      </CardBody>
    </Card>
  );
};
Частые проблемы и решения
1. Потеря состояния подключения при навигации
Проблема: useComPort вызывается в каждом компоненте → разные экземпляры
Решение: SerialPortProvider в app/ уровне, useSerialPortContext() везде

2. График не растягивается на всю ширину
Проблема: Фиксированная ширина контейнеров
Решение: Добавить className="w-full" на всех уровнях до корня

3. Дублирование кнопок Table/Chart
Проблема: Кнопки в Charts и в каждом feature
Решение: Единый MonitoringDashboard, который рендерит нужный feature

4. toFixed на undefined
Проблема: Данные еще не загружены, но уже рендерятся
Решение: Проверки isFinite() и условный рендеринг

5. Таблица показывает записи, а не каналы
Проблема: Неправильная группировка данных
Решение: Функция groupDataByPowerId() возвращает массив каналов

Best Practices
Всегда используйте TypeScript - строгая типизация предотвращает ошибки
Логируйте все IPC вызовы - упрощает отладку
Используйте useMemo для тяжелых вычислений - оптимизация производительности
Проверяйте isMounted перед setState - предотвращает memory leaks
IndexedDB для больших данных - не перегружайте appData
Транзакции для БД - гарантируют целостность данных
Cleanup в useEffect - отписывайтесь от событий
Константы для каналов - избегайте магических строк
i18n для всех текстов - даже для console.log в production
Анимации через Framer Motion - плавные переходы
Полезные команды
bash
# Разработка
npm run dev                  # Dev mode с hot reload
npm run build               # Production build
npm run package             # Создать installer

# База данных
npm run db:migrate          # Запустить миграции
npm run db:seed             # Заполнить тестовыми данными
npm run db:reset            # Сбросить БД

# Тестирование
npm run test                # Запустить тесты
npm run test:e2e            # E2E тесты
npm run lint                # Проверка кода
npm run type-check          # TypeScript проверка
Переменные окружения
env
NODE_ENV=development        # development | production
VITE_DEV_SERVER_URL=http://localhost:3000
ELECTRON_IS_DEV=1
LOG_LEVEL=debug            # debug | info | warn | error
Важные файлы
forge.config.ts - Конфигурация Electron Forge
vite.config.ts - Конфигурация Vite
tsconfig.json - TypeScript конфигурация
src/main/index.ts - Точка входа Electron Main
src/renderer/index.tsx - Точка входа React
src/preload/index.ts - Preload script (IPC bridge)
yaml

---

# 3. 🤖 Промпт для настройки агента

```markdown
# Системный промпт для AI-ассистента FBG Interrogator Project

Ты - эксперт-разработчик приложения для мониторинга FBG (Fiber Bragg Grating) датчиков. Твоя задача - помогать разрабатывать desktop приложение на Electron + React + TypeScript с использованием Feature-Sliced Design архитектуры.

## Технический стек
- **Frontend:** React 18, TypeScript 5, HeroUI (NextUI), Framer Motion, Recharts
- **Backend:** Electron 28+, Node.js 20+, SerialPort, better-sqlite3
- **Архитектура:** FSD (Feature-Sliced Design)
- **Сборка:** Electron Forge + Vite

## Принципы разработки

### 1. Архитектурные правила FSD

**Структура слоев (сверху вниз):**
app/ → pages/ → widgets/ → features/ → entities/ → shared/