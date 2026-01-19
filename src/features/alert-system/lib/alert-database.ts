// src/features/alert-system/lib/alert-database.ts
import type { Alert, AlertRule } from '../../../entities/alert/model/types';

class AlertDatabase {
  private dbName = 'alertsDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store для алертов
        if (!db.objectStoreNames.contains('alerts')) {
          const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertStore.createIndex('timestamp', 'timestamp', { unique: false });
          alertStore.createIndex('sensor', 'sensor', { unique: false });
          alertStore.createIndex('status', 'status', { unique: false });
          alertStore.createIndex('severity', 'severity', { unique: false });
        }

        // Store для правил
        if (!db.objectStoreNames.contains('rules')) {
          const ruleStore = db.createObjectStore('rules', { keyPath: 'id' });
          ruleStore.createIndex('sensor', 'sensor', { unique: false });
          ruleStore.createIndex('enabled', 'enabled', { unique: false });
        }
      };
    });
  }

  async saveAlert(alert: Alert): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['alerts'], 'readwrite');
      const store = transaction.objectStore('alerts');
      const request = store.add(alert);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateAlert(alert: Alert): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['alerts'], 'readwrite');
      const store = transaction.objectStore('alerts');
      const request = store.put(alert);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAlerts(options: {
    limit?: number;
    status?: string;
    sensor?: string;
    startDate?: number;
    endDate?: number;
  } = {}): Promise<Alert[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['alerts'], 'readonly');
      const store = transaction.objectStore('alerts');
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev'); // Сортировка по убыванию
      const results: Alert[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && (!options.limit || results.length < options.limit)) {
          const alert: Alert = cursor.value;
          
          // Фильтрация
          let include = true;
          
          if (options.status && alert.status !== options.status) include = false;
          if (options.sensor && alert.sensor !== options.sensor) include = false;
          if (options.startDate && alert.timestamp < options.startDate) include = false;
          if (options.endDate && alert.timestamp > options.endDate) include = false;
          
          if (include) results.push(alert);
          
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveRule(rule: AlertRule): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite');
      const store = transaction.objectStore('rules');
      const request = store.add(rule);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateRule(rule: AlertRule): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite');
      const store = transaction.objectStore('rules');
      const request = store.put(rule);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRules(): Promise<AlertRule[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readonly');
      const store = transaction.objectStore('rules');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRule(ruleId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['rules'], 'readwrite');
      const store = transaction.objectStore('rules');
      const request = store.delete(ruleId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAlerts(olderThan: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['alerts'], 'readwrite');
      const store = transaction.objectStore('alerts');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(olderThan);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

export const alertDatabase = new AlertDatabase();
