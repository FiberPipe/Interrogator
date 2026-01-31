// src/electron/features/serial/serial.config.ts

import type { SerialConfig } from './serial.types';
import { DEFAULT_SERIAL_CONFIG } from './serial.constants';
import { ENV } from '../../core/env';
import { logger } from '../logger';
import { LogMetadata } from '../../../shared/types/logs.types';

export class SerialConfigManager {
  private config: SerialConfig;

  constructor(config?: Partial<SerialConfig>) {
    this.config = {
      ...DEFAULT_SERIAL_CONFIG,
      ...config,
      useMockPorts: ENV.WITH_MOCK_PORTS,
    };
  }

  /**
   * Получить текущую конфигурацию
   */
  getConfig(): SerialConfig {
    return { ...this.config };
  }

  /**
   * Обновить конфигурацию
   */
  updateConfig(config: Partial<SerialConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Serial', 'Configuration updated', this.config as unknown as LogMetadata);
  }

  /**
   * Получить baudRate
   */
  getBaudRate(): number {
    return this.config.defaultBaudRate;
  }

  /**
   * Проверить нужно ли использовать mock порты
   */
  shouldUseMockPorts(): boolean {
    return this.config.useMockPorts;
  }

  /**
   * Проверить включено ли автоподключение
   */
  isAutoConnectEnabled(): boolean {
    return this.config.autoConnect;
  }
}

// Singleton instance
let configManager: SerialConfigManager | null = null;

export function getSerialConfigManager(): SerialConfigManager {
  if (configManager === null) {
    configManager = new SerialConfigManager();
  }
  return configManager;
}

export function initializeSerialConfig(config?: Partial<SerialConfig>): void {
  configManager = new SerialConfigManager(config);

  logger.info('Serial', 'Config manager initialized', {
    config: configManager.getConfig(),
  });
}
