import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { app } from 'electron';
import { join } from 'node:path';

const dbPath = join(app.getPath('userData'), 'data.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite);
