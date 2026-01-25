import { config } from 'dotenv';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

export type NodeEnv = 'development' | 'production' | 'test';

interface MainEnvConfig {
  NODE_ENV: NodeEnv;
  WITH_MOCK_PORTS: boolean;
}

function loadEnvFile(): void {
  const rootDir = process.cwd();

  const envFile = '.env';

  const envPath = join(rootDir, envFile);

  if (existsSync(envPath)) {
    console.log(`[Env] Loading environment from: ${envPath}`);
    config({ path: envPath });
  } else {
    console.warn(`[Env] Environment file not found: ${envPath}`);
    console.warn(`[Env] Using default values`);
  }
}

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;

  return value.toLowerCase() === 'true';
}

function initEnv(): MainEnvConfig {
  loadEnvFile();

  const nodeEnv = getEnv('NODE_ENV', 'development') as NodeEnv;
  const mockPortsEnv = getEnvBoolean('WITH_MOCK_PORTS', false);

  const config: MainEnvConfig = {
    NODE_ENV: nodeEnv,
    WITH_MOCK_PORTS: mockPortsEnv,
  };

  return config;
}

export const ENV = initEnv();

export function logEnvConfig(): void {
  console.log('[Env] =================================');
  console.log('[Env] Configuration:');
  console.log('[Env] Environment:', ENV.NODE_ENV);
  console.log('[Env] =================================');
}
