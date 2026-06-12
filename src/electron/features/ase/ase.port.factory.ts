// src/electron/features/ase/ase.port.factory.ts

import { ENV } from '../../core/env';
import { AsePort } from './ase.port';
import { MockAsePort } from './services/mock-ase-port.service';
import type { AsePortClosedHandler, AsePortErrorHandler, IAsePort } from './ase.types';
import { logger } from '../logger';

/**
 * Создать транспорт ASE: in-process эмулятор при WITH_MOCK_PORTS,
 * иначе реальный последовательный порт.
 */
export function createAsePort(
  path: string,
  onClosed: AsePortClosedHandler,
  onError: AsePortErrorHandler,
): IAsePort {
  if (ENV.WITH_MOCK_PORTS) {
    logger.info('ASE', 'Using mock ASE port (WITH_MOCK_PORTS)', { path });
    return new MockAsePort(path, onClosed, onError);
  }

  return new AsePort(path, onClosed, onError);
}
