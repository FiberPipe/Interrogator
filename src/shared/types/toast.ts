export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading',
}

export interface ToastMessage {
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Предустановленные сообщения для частых операций
 */
export const TOAST_MESSAGES = {
  // Подключение к порту
  PORT_CONNECTED: 'Порт успешно подключен',
  PORT_DISCONNECTED: 'Порт отключен',
  PORT_ERROR: 'Ошибка подключения к порту',
  PORT_NOT_FOUND: 'Порт не найден',

  // Данные
  DATA_SAVED: 'Данные успешно сохранены',
  DATA_LOADED: 'Данные загружены',
  DATA_ERROR: 'Ошибка при работе с данными',

  // Настройки
  SETTINGS_SAVED: 'Настройки сохранены',
  SETTINGS_RESET: 'Настройки сброшены',
  SETTINGS_ERROR: 'Ошибка сохранения настроек',

  // Датчики
  SENSOR_ADDED: 'Датчик добавлен',
  SENSOR_REMOVED: 'Датчик удален',
  SENSOR_UPDATED: 'Датчик обновлен',
  SENSOR_CALIBRATION_START: 'Калибровка датчика начата',
  SENSOR_CALIBRATION_SUCCESS: 'Калибровка завершена успешно',
  SENSOR_CALIBRATION_ERROR: 'Ошибка калибровки датчика',

  // Общие
  OPERATION_SUCCESS: 'Операция выполнена успешно',
  OPERATION_ERROR: 'Произошла ошибка',
  LOADING: 'Загрузка...',
} as const;
