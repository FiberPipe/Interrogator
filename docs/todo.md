# Roadmap развития FBG Interrogator App

## ✅ Реализовано

### Архитектура
- [x] FSD (Feature-Sliced Design) архитектура
- [x] Electron + React + TypeScript стек
- [x] Полностью оффлайн приложение
- [x] SQLite база данных для хранения данных
- [x] IPC коммуникация между main и renderer процессами

### Функционал
- [x] OnBoarding процесс (язык, тема, датчики, порт, финал)
- [x] Подключение к COM-портам
- [x] Реал-тайм мониторинг данных с датчиков
- [x] Обработка данных на backend (нормализация, wavelength расчет)
- [x] 4 типа мониторинга (Power, Wavelength, Temperature, Displacement)
- [x] Графики с Recharts (zoom, confidence intervals)
- [x] Таблицы с редактируемыми коэффициентами
- [x] Конфигурация датчиков (до 8 датчиков, до 4 каналов каждый)
- [x] Калибровочные данные (нормализация, длины волн)
- [x] Множественные методы ввода данных (таблица, CSV, JSON, Monaco Editor)
- [x] Интернационализация (RU, EN, CN)
- [x] Темная/светлая тема
- [x] Сохранение настроек в appData
- [x] Context providers (SerialPort, Theme, i18n)

## 🚧 В процессе реализации

### 1. Система алертов (Alerts System) ⚠️
**Приоритет: ВЫСОКИЙ**

#### Backend (Electron)
- [ ] Alert Rule Engine
  - [ ] Проверка условий в реальном времени
  - [ ] Cooldown между алертами
  - [ ] Rate of change detection
- [ ] Alert Actions Executor
  - [ ] Воспроизведение звуков (разные для каждого severity)
  - [ ] Desktop notifications
  - [ ] Создание snapshots данных
  - [ ] Логирование в файл
- [ ] Alert Storage (IndexedDB)
  - [ ] Сохранение истории алертов
  - [ ] Индексы для быстрого поиска
  - [ ] Автоочистка старых записей

#### Frontend
- [ ] Alert Panel Widget
  - [ ] Список активных алертов
  - [ ] История алертов с фильтрацией
  - [ ] Статистика (по severity, по датчикам)
- [ ] Alert Rule Manager
  - [ ] CRUD операции с правилами
  - [ ] Визуальный конструктор условий
  - [ ] Тестирование правил
- [ ] Alert Indicator
  - [ ] Badge с количеством активных
  - [ ] Звуковая индикация
  - [ ] Цветовая индикация severity
- [ ] Alert Actions UI
  - [ ] Acknowledge (подтверждение)
  - [ ] Resolve (решение)
  - [ ] Mute (отключение звука)
  - [ ] Bulk operations

#### Функции
- [ ] Threshold alerts (мин/макс)
- [ ] Duration alerts (условие N секунд)
- [ ] Rate of change alerts (скорость изменения)
- [ ] Pattern alerts (распознавание паттернов)
- [ ] Multi-sensor alerts (корреляция датчиков)

### 2. Экспорт и отчеты (Export & Reports) 📄
**Приоритет: ВЫСОКИЙ**

#### Форматы экспорта
- [ ] CSV Export
  - [ ] Выбор диапазона времени
  - [ ] Выбор датчиков/каналов
  - [ ] Выбор метрик (raw, normalized, calculated)
  - [ ] Настройка разделителей
- [ ] Excel Export (xlsx)
  - [ ] Множественные листы (по датчикам)
  - [ ] Форматирование ячеек
  - [ ] Встроенные графики
  - [ ] Сводные таблицы
  - [ ] Формулы для расчетов
- [ ] JSON Export
  - [ ] Полный дамп сессии
  - [ ] Структурированный формат
  - [ ] Метаданные
- [ ] PDF Reports
  - [ ] Шаблоны отчетов
  - [ ] Графики и таблицы
  - [ ] Статистика и анализ
  - [ ] Логотип и брендинг

#### Генератор отчетов
- [ ] Report Builder UI
  - [ ] Drag & drop компоненты
  - [ ] Предпросмотр
  - [ ] Сохранение шаблонов
- [ ] Шаблоны отчетов
  - [ ] Экспресс-отчет (quick summary)
  - [ ] Детальный отчет (full analysis)
  - [ ] Сравнительный отчет (compare periods)
  - [ ] Аварийный отчет (incidents)
- [ ] Автоматизация
  - [ ] Расписание генерации
  - [ ] Авто-экспорт при условиях
  - [ ] Пакетная генерация

#### Статистический анализ
- [ ] Descriptive statistics
  - [ ] Mean, median, mode
  - [ ] Standard deviation
  - [ ] Min/max/range
  - [ ] Percentiles
- [ ] Trend analysis
  - [ ] Linear regression
  - [ ] Moving averages
  - [ ] Seasonal decomposition
- [ ] Correlation analysis
  - [ ] Between sensors
  - [ ] Cross-correlation
  - [ ] Heat maps

### 3. Dashboard Constructor 🎛️
**Приоритет: СРЕДНИЙ**

#### Конструктор
- [ ] Grid Layout System
  - [ ] Drag & drop виджетов
  - [ ] Resize виджетов
  - [ ] Snap to grid
  - [ ] Responsive breakpoints
- [ ] Widget Library
  - [ ] Chart widgets (line, bar, gauge, etc.)
  - [ ] Table widget
  - [ ] Stat card widget
  - [ ] Alert widget
  - [ ] Map/Heatmap widget
- [ ] Widget Configuration
  - [ ] Data source selection
  - [ ] Appearance settings
  - [ ] Refresh interval
  - [ ] Alert thresholds

#### Виджеты
- [ ] Line Chart Widget
- [ ] Bar Chart Widget
- [ ] Gauge Widget (circular, linear)
- [ ] Stat Card Widget (KPI)
- [ ] Table Widget (live data)
- [ ] Sparkline Widget
- [ ] Heatmap Widget (multiple sensors)
- [ ] Status Indicator Widget
- [ ] Alert List Widget
- [ ] Session Info Widget

#### Управление
- [ ] Dashboard Templates
  - [ ] Шаблон "Обзор"
  - [ ] Шаблон "Детальный мониторинг"
  - [ ] Шаблон "Алерты"
  - [ ] Пользовательские шаблоны
- [ ] Dashboard Presets
  - [ ] Сохранение layouts
  - [ ] Импорт/экспорт
  - [ ] Версионирование
- [ ] Presentation Mode
  - [ ] Полноэкранный режим
  - [ ] Автопереключение dashboard'ов
  - [ ] TV mode (для мониторинга)

## 📝 Backlog (Будущие фичи)

### ML и AI
- [ ] Anomaly Detection
  - [ ] Isolation Forest
  - [ ] LSTM для временных рядов
  - [ ] Autoencoder для паттернов
- [ ] Predictive Maintenance
  - [ ] Прогноз отказов
  - [ ] Оценка остаточного ресурса
  - [ ] Рекомендации по обслуживанию
- [ ] Auto-calibration
  - [ ] Предложение коэффициентов
  - [ ] Валидация калибровки
  - [ ] Оптимизация параметров

### Расширенная аналитика
- [ ] FFT Analysis (для вибраций)
- [ ] Correlation Matrix
- [ ] PCA (Principal Component Analysis)
- [ ] Clustering (K-means, DBSCAN)
- [ ] Event Detection & Classification

### Визуализация
- [ ] 3D Plots (поверхности)
- [ ] Heatmaps (множество датчиков)
- [ ] Waterfall Charts
- [ ] Box Plots
- [ ] Polar Charts
- [ ] Histogram & Distribution

### Система триггеров
- [ ] Trigger Rule Engine
  - [ ] Условия с логическими операциями
  - [ ] Составные условия (AND, OR)
  - [ ] Временные окна
- [ ] Trigger Actions
  - [ ] Запуск/остановка записи
  - [ ] Создание маркеров
  - [ ] Запуск внешних скриптов
  - [ ] Изменение конфигурации

### Управление данными
- [ ] Data Archiving
  - [ ] Сжатие старых данных
  - [ ] Перенос в архивные БД
  - [ ] Автоматическая очистка
- [ ] Data Replication
  - [ ] Синхронизация между устройствами (по USB/сети)
  - [ ] Резервное копирование на внешние диски
  - [ ] Incremental backups
- [ ] Data Validation
  - [ ] Проверка целостности
  - [ ] Обнаружение повреждений
  - [ ] Автовосстановление

### Профили и конфигурации
- [ ] Profile Manager
  - [ ] CRUD операции
  - [ ] Быстрое переключение
  - [ ] Импорт/экспорт
- [ ] Configuration Templates
  - [ ] Для разных типов экспериментов
  - [ ] Библиотека шаблонов
  - [ ] Шаринг между пользователями
- [ ] Version Control
  - [ ] История изменений конфигурации
  - [ ] Откат к предыдущим версиям
  - [ ] Diff между версиями

### FBG-специфичные инструменты
- [ ] Spectrum Analyzer
  - [ ] Peak detection
  - [ ] Bandwidth calculation
  - [ ] Signal-to-noise ratio
- [ ] Multiplexing Tools
  - [ ] Demultiplexing
  - [ ] Channel isolation
  - [ ] Crosstalk measurement
- [ ] Crosstalk Compensation
  - [ ] Matrix calculation
  - [ ] Automatic compensation
- [ ] Environmental Compensation
  - [ ] Temperature compensation
  - [ ] Humidity compensation
  - [ ] Pressure compensation

### UI/UX улучшения
- [ ] Пользовательские темы
- [ ] Горячие клавиши
- [ ] Command Palette (Cmd+K)
- [ ] Интерактивный тур
- [ ] Контекстные подсказки
- [ ] Accessibility (WCAG 2.1)
- [ ] Адаптивная компоновка

### Безопасность
- [ ] Аутентификация (опционально)
  - [ ] Локальные пользователи
  - [ ] Роли и права
- [ ] Шифрование
  - [ ] Шифрование БД
  - [ ] Шифрование бэкапов
- [ ] Audit Log
  - [ ] Логирование действий
  - [ ] Просмотр истории
- [ ] Session Management
  - [ ] Таймауты
  - [ ] Блокировка экрана

### Производительность
- [ ] Virtual Scrolling (большие таблицы)
- [ ] Web Workers (тяжелые вычисления)
- [ ] Caching Strategy
  - [ ] Memory cache
  - [ ] Disk cache
  - [ ] Cache invalidation
- [ ] Lazy Loading
  - [ ] Модули
  - [ ] Исторические данные
  - [ ] Графики
- [ ] Progressive Loading
  - [ ] Постепенная загрузка данных
  - [ ] Skeleton screens

### Интеграции (опциональные, через файлы)
- [ ] MQTT Export
  - [ ] Публикация данных в локальные топики
- [ ] InfluxDB Export
  - [ ] Экспорт в формате Line Protocol
- [ ] Grafana Integration
  - [ ] Экспорт JSON для Grafana
- [ ] Custom Scripts
  - [ ] Python/Node.js скрипты для обработки
  - [ ] Webhook симуляция через файлы

### Документация
- [ ] Встроенная справка
  - [ ] Поиск по справке
  - [ ] Контекстная помощь
- [ ] Tutorials
  - [ ] Интерактивные туториалы
  - [ ] Видео-гайды
- [ ] API Documentation
  - [ ] Для разработчиков
  - [ ] Примеры использования
- [ ] Changelog
  - [ ] История версий
  - [ ] Список изменений

### Collaborative Features (offline)
- [ ] Annotations
  - [ ] Комментарии к данным
  - [ ] Метки событий
  - [ ] Теги
- [ ] Workspace Sharing
  - [ ] Экспорт/импорт workspace
  - [ ] Шаблоны проектов
- [ ] Session Comparison
  - [ ] Сравнение нескольких сессий
  - [ ] Diff визуализация
  - [ ] Метрики сравнения

## 🎯 Критические для v1.0
1. ✅ Базовый мониторинг (Power, Wavelength)
2. ✅ Подключение к портам
3. ✅ Сохранение в БД
4. ⏳ Система алертов
5. ⏳ Экспорт в CSV/Excel
6. ⏳ PDF отчеты
7. ⏳ Dashboard constructor

## 🚀 Для v2.0
1. ML anomaly detection
2. Расширенная аналитика
3. Trigger system
4. Профили конфигураций
5. FBG-специфичные инструменты

## 💡 Для v3.0
1. Collaborative features
2. Advanced visualizations
3. Performance optimizations
4. Интеграции
5. Mobile companion app (просмотр данных)
