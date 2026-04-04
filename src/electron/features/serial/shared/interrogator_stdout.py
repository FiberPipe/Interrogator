# interrogator_stdout.py
"""
Запускается Electron'ом как дочерний процесс.
Читает бинарный поток с Arduino, конвертирует фреймы в JSON,
печатает по одной строке на stdout.

Формат строки (совместим с RawSensorData):
{"id": 123, "time": 1.234567, "P0": 512, "P1": 300, ..., "P15": 800}

Аргументы:
  argv[1] = COM-порт  (например COM3 или /dev/ttyUSB0)
  argv[2] = baud      (опционально, по умолчанию 500000)
"""

import sys
import json
from interrogator_io import Interrogator, NCH

def main():
    if len(sys.argv) < 2:
        print("Usage: interrogator_stdout.py <port> [baud]", file=sys.stderr)
        sys.exit(1)

    port = sys.argv[1]
    baud = int(sys.argv[2]) if len(sys.argv) > 2 else 500000

    inq = Interrogator(port=port, baud=baud)
    inq.start()

    try:
        while True:
            # Блок по 1 секунде — размер не важен, главное непрерывность
            block = inq.read_block(seconds=1.0)

            for i in range(len(block.rec_id)):
                row = {
                    "id":   int(block.rec_id[i]),
                    "time": float(block.t_s[i]),
                }
                for ch in range(NCH):
                    row[f"P{ch}"] = int(block.adc[i, ch])

                # Одна строка = один фрейм, flush обязателен
                print(json.dumps(row), flush=True)

    except KeyboardInterrupt:
        pass
    finally:
        inq.stop()

if __name__ == "__main__":
    main()
