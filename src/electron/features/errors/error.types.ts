// src/shared/types/error.types.ts

import type { LogArea, LogMetadata } from '../../../shared/types/logs.types';

export interface AppErrorMeta {
  [key: string]: unknown;
  area?: LogArea;
  operationId?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

export type ErrorStatus = 'handled' | 'unhandled' | 'recovered';

export class AppError extends Error {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly meta?: AppErrorMeta;
  readonly cause?: unknown;
  readonly timestamp: number;
  readonly status: ErrorStatus;
  readonly area?: LogArea;

  constructor(params: {
    code: string;
    title: string;
    description: string;
    meta?: AppErrorMeta;
    cause?: unknown;
    status?: ErrorStatus;
    area?: LogArea;
  }) {
    super(params.description);

    this.name = 'AppError';
    this.code = params.code;
    this.title = params.title;
    this.description = params.description;
    this.meta = params.meta;
    this.cause = params.cause;
    this.timestamp = Date.now();
    this.status = params.status ?? 'unhandled';
    this.area = params.area ?? (params.meta?.area as LogArea);

    Error.captureStackTrace?.(this, AppError);
  }

  /**
   * Отметить ошибку как обработанную
   */
  markAsHandled(): AppError {
    return new AppError({
      code: this.code,
      title: this.title,
      description: this.description,
      meta: this.meta,
      cause: this.cause,
      status: 'handled',
      area: this.area,
    });
  }

  /**
   * Отметить ошибку как восстановленную
   */
  markAsRecovered(): AppError {
    return new AppError({
      code: this.code,
      title: this.title,
      description: this.description,
      meta: this.meta,
      cause: this.cause,
      status: 'recovered',
      area: this.area,
    });
  }

  /**
   * Получить метаданные для логирования
   */
  toLogMetadata(): LogMetadata {
    return {
      errorCode: this.code,
      errorType: this.name,
      errorStatus: this.status,
      errorTitle: this.title,
      errorTimestamp: this.timestamp,
      ...this.meta,
    };
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      title: this.title,
      description: this.description,
      meta: this.meta,
      timestamp: this.timestamp,
      status: this.status,
      area: this.area,
    };
  }
}
