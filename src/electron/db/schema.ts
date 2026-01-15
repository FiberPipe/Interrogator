import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Основная таблица с данными датчиков
export const sensorData = sqliteTable('sensor_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recordId: text('record_id').notNull(),
  timestamp: integer('timestamp').notNull(), // Unix timestamp в мс
  time: text('time').notNull(), // Время в формате HH:MM:SS.mmm
  port: text('port').notNull(), // Порт откуда пришли данные
  rawData: text('raw_data').notNull(), // Весь JSON как текст
  createdAt: integer('created_at').notNull(), // Когда записано в БД
});

// Таблица для отдельных каналов (нормализованная структура)
export const channelData = sqliteTable('channel_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sensorDataId: integer('sensor_data_id').notNull().references(() => sensorData.id),
  channel: integer('channel').notNull(), // 0-15
  value: real('value').notNull(),
  stdDev: real('std_dev'),
  timestamp: integer('timestamp').notNull(),
});

// Таблица для конфигурации сенсоров (для связи каналов с физическими датчиками)
export const sensorConfig = sqliteTable('sensor_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sensorIndex: integer('sensor_index').notNull().unique(),
  sensorType: text('sensor_type').notNull(),
  channels: text('channels').notNull(), // JSON массив каналов
  name: text('name'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Статистика по сессиям
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  port: text('port').notNull(),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time'),
  recordCount: integer('record_count').notNull().default(0),
  status: text('status').notNull().default('active'), // active, stopped, error
});
