-- features/database/schema.sql
-- Добавляем normalized значения в channels
CREATE TABLE IF NOT EXISTS sensor_channels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_id INTEGER NOT NULL,
  channel INTEGER NOT NULL,
  value REAL NOT NULL,
  normalized REAL, -- 👈 Нормализованное значение
  std_dev REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (data_id) REFERENCES sensor_data (id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_channels_data_channel ON sensor_channels(data_id, channel);
CREATE INDEX IF NOT EXISTS idx_channels_normalized ON sensor_channels(normalized);
