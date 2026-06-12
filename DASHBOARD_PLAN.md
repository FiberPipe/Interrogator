# Dashboard — план реализации

## Контекст

`DashboardPage` сейчас пустой. `ChartsPage` уже реализует real-time мониторинг по одному типу сенсора. Dashboard должен быть **другим**: обзор всех 16 каналов одновременно, сводные метрики, исторические данные из базы — в отличие от Charts, где глубокий анализ одного типа.

---

## Фаза 1 — Обзорный грид каналов (основа)

**Цель:** показать все 16 каналов сразу, с текущими значениями в реальном времени.

- [ ] Создать `src/widgets/dashboard/ui/ChannelOverviewGrid.tsx` — сетка карточек (4×4 или 2×8)
- [ ] Создать `src/entities/sensor/ui/ChannelSummaryCard.tsx` — карточка одного канала:
  - текущее значение (power + wavelength)
  - computed temperature / displacement (если настроена калибровка)
  - статус алерта (цвет border/badge)
  - sparkline последних ~20 точек
- [ ] Переиспользовать `useSerialData` из `widgets/monitoring-dashboard/hooks/useSerialData.tsx`
- [ ] Наполнить `DashboardPage` грид-виджетом

---

## Фаза 2 — Верхняя панель статистики сессии

**Цель:** быстрый взгляд на состояние системы без скролла.

- [ ] Создать `src/widgets/dashboard/ui/SessionStatsBar.tsx` — горизонтальная полоса:
  - статус подключения (connected / waiting / disconnected)
  - длительность текущей сессии
  - количество записей в буфере
  - количество каналов в алерте
  - последнее обновление (timestamp)
- [ ] Переиспользовать `useSerialPortContext` + `useSerialData`

---

## Фаза 3 — Исторические данные из БД

**Цель:** просмотр данных за прошлые сессии прямо в Dashboard.

- [ ] Добавить IPC endpoint `getChannelStatsAll` в `src/electron/features/database/database.ipc.ts` — агрегация по всем 16 каналам за период одним SQL-запросом
- [ ] Добавить метод `getAllChannelStats` в `src/electron/features/database/services/sensor-data.service.ts`
- [ ] Создать `src/features/dashboard-history/model/useDashboardHistory.ts` — хук:
  - вызывает `getChannelStatsAll` через `window.electronAPI`
  - возвращает min/max/avg per channel
- [ ] Создать `src/widgets/dashboard/ui/HistoricalPanel.tsx`:
  - переключатель: "Live" / "History"
  - в режиме History: picker диапазона (last 1h / 24h / 7d / custom)
  - таблица статистики по каналам (min, max, avg)

---

## Фаза 4 — Настройка лейаута

**Цель:** пользователь выбирает, что видеть и в каком порядке.

- [ ] Хранить настройки в `app-data` (уже есть `app-data.ts`): выбранные каналы, количество колонок, режим отображения
- [ ] Создать `src/features/dashboard-settings/ui/DashboardSettingsPanel.tsx`:
  - количество колонок: 2 / 4 / 8
  - показывать / скрывать каналы
  - порядок карточек (drag-and-drop — опционально)

---

## Фаза 5 — i18n + финальная интеграция

- [ ] Добавить ключи в `en/ru/zh` локали (`dashboard.json`)
- [ ] Убрать badge `beta` из навигации (`src/widgets/sidebar/model/constants.tsx`)

---

## Приоритеты

| # | Задача | Сложность | Приоритет |
|---|--------|-----------|-----------|
| 1 | Фаза 1: грид карточек с live данными | M | P0 |
| 2 | Фаза 2: статус-бар сессии | S | P0 |
| 3 | Фаза 3: IPC endpoint + история | M | P1 |
| 4 | Фаза 3: Historical Panel UI | M | P1 |
| 5 | Фаза 4: настройки лейаута | M | P2 |

---

## Новые файлы

```
src/widgets/dashboard/
  ui/ChannelOverviewGrid.tsx
  ui/SessionStatsBar.tsx
  ui/HistoricalPanel.tsx
  index.ts

src/features/dashboard-history/
  model/useDashboardHistory.ts

src/features/dashboard-settings/
  ui/DashboardSettingsPanel.tsx

src/shared/i18n/locales/en/dashboard.json
src/shared/i18n/locales/ru/dashboard.json
src/shared/i18n/locales/zh/dashboard.json
```

## Изменяемые файлы

- `src/pages/Dashboard.tsx` — наполнить виджетами
- `src/electron/features/database/database.ipc.ts` — новый IPC `getChannelStatsAll`
- `src/electron/features/database/services/sensor-data.service.ts` — метод агрегации
- `src/widgets/sidebar/model/constants.tsx` — убрать badge beta
