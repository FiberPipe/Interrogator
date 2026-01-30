// src/shared/errors/error-factory.ts

import type { LogArea } from '../../../shared/types/logs.types';
import type { ErrorCode } from './error-codes';
import { AppError } from './error.types';

export interface CreateErrorParams {
  code: ErrorCode;
  title: string;
  description: string;
  meta?: Record<string, unknown>;
  cause?: unknown;
  area?: LogArea;
}

export function createError(params: CreateErrorParams): AppError {
  return new AppError(params);
}

export function wrapError(cause: unknown, params: Omit<CreateErrorParams, 'cause'>): AppError {
  return new AppError({ ...params, cause });
}
