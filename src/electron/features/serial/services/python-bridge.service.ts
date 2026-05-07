// src/electron/features/serial/services/python-bridge.service.ts

import { spawn, ChildProcess } from 'child_process';
import * as path from 'node:path';
import type { IDataProcessor } from '../serial.types';

export class PythonBridgeService {
  private process: ChildProcess | null = null;
  private lineBuffer = '';

  constructor(
    private readonly port: string,
    private readonly baud: number,
    private readonly processor: IDataProcessor,
    private readonly scriptDir: string, // путь к папке со скриптами
  ) { }

  start(): void {
    const script = path.join('./src/electron/features/serial/shared/interrogator_stdout.py');

    const pythonCmd = this.findPythonCommand();

    this.process = spawn(pythonCmd, [script, this.port, String(this.baud)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // stdout → processData
    this.process.stdout!.setEncoding('utf8');
    this.process.stdout!.on('data', (chunk: string) => {
      // Буферизуем: между chunk'ами могут быть обрезанные строки
      this.lineBuffer += chunk;
      const lines = this.lineBuffer.split('\n');
      this.lineBuffer = lines.pop() ?? ''; // последняя неполная строка

      for (const line of lines) {
        const trimmed = line.trim();

        console.log(2222222, trimmed);
        if (trimmed) {
          // Передаём как обычную JSON-строку — processData не меняется
          void this.processor.processData(trimmed);
        }
      }
    });

    this.process.stderr!.setEncoding('utf8');
    this.process.stderr!.on('data', (msg: string) => {
      console.error('[PythonBridge]', msg.trim());
    });

    this.process.on('exit', (code) => {
      console.warn('[PythonBridge] process exited with code', code);
    });
  }

  stop(): void {
    this.process?.kill();
    this.process = null;
  }

  private findPythonCommand(): string {
    // На Windows может быть python, python3, или py
    const candidates = ['python', 'python3', 'py'];

    for (const cmd of candidates) {
      try {
        const result = require('child_process').spawnSync(cmd, ['--version']);
        if (result.status === 0) {
          return cmd;
        }
      } catch {
        continue;
      }
    }

    // fallback
    return 'python';
  }
}
