import type { LogLevel } from "./Settings";

// Функция для генерации примеров логов БД
export const generateSampleLogs = () => {
    const now = new Date();
    return [
      // Соединение
      {
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        message: 'Соединение с базой данных установлено',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3590000).toISOString(),
        message: 'Подключено к postgresql на db-server.example.com:5432',
        level: 'info' as LogLevel
      },
      
      // Выполнение запросов
      {
        timestamp: new Date(now.getTime() - 3500000).toISOString(),
        message: 'Выполнение запроса: SELECT * FROM users LIMIT 100',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3480000).toISOString(),
        message: 'Запрос выполнен успешно. Получено строк: 78',
        level: 'info' as LogLevel
      },
      
      // Предупреждения
      {
        timestamp: new Date(now.getTime() - 3400000).toISOString(),
        message: 'Медленный запрос: UPDATE orders SET status = "processed" WHERE created_at < "2023-01-01" (время выполнения: 2.3 сек)',
        level: 'warning' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3380000).toISOString(),
        message: 'Индекс idx_order_date отсутствует или не используется в запросе',
        level: 'warning' as LogLevel
      },
      
      // Ошибки
      {
        timestamp: new Date(now.getTime() - 3300000).toISOString(),
        message: 'Ошибка выполнения запроса: INSERT INTO products (name, price) VALUES ("Product A", -10.99)',
        level: 'error' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3290000).toISOString(),
        message: 'Нарушение ограничения CHECK: price должно быть положительным числом',
        level: 'error' as LogLevel
      },
      
      // Транзакции
      {
        timestamp: new Date(now.getTime() - 3200000).toISOString(),
        message: 'Начало транзакции: TX123456',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3190000).toISOString(),
        message: 'Выполнение запроса внутри транзакции: INSERT INTO payments (order_id, amount) VALUES (12345, 199.99)',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3180000).toISOString(),
        message: 'Выполнение запроса внутри транзакции: UPDATE orders SET payment_status = "paid" WHERE id = 12345',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 3170000).toISOString(),
        message: 'Фиксация транзакции: TX123456',
        level: 'info' as LogLevel
      },
      
      // Проблемы с соединением
      {
        timestamp: new Date(now.getTime() - 3000000).toISOString(),
        message: 'Временная потеря соединения с базой данных',
        level: 'warning' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 2990000).toISOString(),
        message: 'Попытка переподключения (1/3)',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 2980000).toISOString(),
        message: 'Соединение восстановлено',
        level: 'info' as LogLevel
      },
      
      // Системные операции
      {
        timestamp: new Date(now.getTime() - 2500000).toISOString(),
        message: 'Начало автоматического резервного копирования базы данных',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 2400000).toISOString(),
        message: 'Резервное копирование завершено успешно: backup_20230615_120000.sql (размер: 256 МБ)',
        level: 'info' as LogLevel
      },
      
      // Ошибка миграции
      {
        timestamp: new Date(now.getTime() - 1800000).toISOString(),
        message: 'Начало выполнения миграции: 20230615_add_user_preferences',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 1790000).toISOString(),
        message: 'Ошибка выполнения миграции: таблица user_preferences уже существует',
        level: 'error' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 1780000).toISOString(),
        message: 'Откат миграции: 20230615_add_user_preferences',
        level: 'info' as LogLevel
      },
      
      // Недавняя активность
      {
        timestamp: new Date(now.getTime() - 600000).toISOString(),
        message: 'Выполнение запроса: SELECT count(*) FROM user_sessions WHERE last_activity > NOW() - INTERVAL 1 HOUR',
        level: 'info' as LogLevel
      },
      {
        timestamp: new Date(now.getTime() - 590000).toISOString(),
        message: 'Результат: 1,342 активных пользователей за последний час',
        level: 'info' as LogLevel
      },
      
      // Закрытие соединения
      {
        timestamp: new Date(now.getTime() - 60000).toISOString(),
        message: 'Соединение с базой данных закрыто',
        level: 'info' as LogLevel
      }
    ];
  };
  
  // Использование:
  // setDbLogs(generateSampleLogs());
  