# interrogator_stdout.py

import sys
import json
import time
from interrogator_io import Interrogator, NCH

def main():
    if len(sys.argv) < 2:
        print("Usage: interrogator_stdout.py <port> [baud]", file=sys.stderr)
        sys.exit(1)

    port = sys.argv[1]
    baud = int(sys.argv[2]) if len(sys.argv) > 2 else 500000

    print(f"[DEBUG] Connecting to {port} at {baud} baud...", file=sys.stderr, flush=True)

    inq = Interrogator(port=port, baud=baud)
    inq.start()

    # Даём время на старт потока и накопление данных
    print(f"[DEBUG] Waiting for data...", file=sys.stderr, flush=True)
    time.sleep(2.0)

    try:
        while True:
            try:
                data = inq.read_avg_block(seconds=1.0, avg_sec=1.0)

                # print(f"[DEBUG] Got b/lock: {len(data.rec_id)} frames, stats: {inq.stats}", file=sys.stderr, flush=True)

                for i in range(len(data["t_s"])):
                    row = {
                        "time": float(data["t_s"][i]),
                    }
                for ch in range(NCH):
                    row[f"P{ch}"] = float(data["mean"][i][ch])

                    print(json.dumps(row), flush=True)

            except TimeoutError as e:
                print(f"[DEBUG] Timeout: {e}", file=sys.stderr, flush=True)
                print(f"[DEBUG] Stats: {inq.stats}", file=sys.stderr, flush=True)
                # Не падаем, ждём дальше
                continue

    except KeyboardInterrupt:
        pass
    finally:
        inq.stop()

if __name__ == "__main__":
    main()
