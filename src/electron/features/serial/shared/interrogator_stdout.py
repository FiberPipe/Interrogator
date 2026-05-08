# interrogator_stdout.py

import sys
import json
import time
from pathlib import Path
from interrogator_io import Interrogator, NCH

# --- демодуляция ---
_SHARED_DIR = Path(__file__).resolve().parent
_DEMOD_SRC  = _SHARED_DIR / "demodulation_methods" / "cog" / "src"
_MODEL_DIR  = _SHARED_DIR / "demodulation_methods" / "cog" / "models" / "cog_lut_v01"

sys.path.insert(0, str(_DEMOD_SRC))
from cog_lut_demod import demodulate 


def main():
    if len(sys.argv) < 2:
        print("Usage: interrogator_stdout.py <port> [baud]", file=sys.stderr)
        sys.exit(1)

    port = sys.argv[1]
    baud = int(sys.argv[2]) if len(sys.argv) > 2 else 500000

    print(f"[DEBUG] Connecting to {port} at {baud} baud...", file=sys.stderr, flush=True)
    print(f"[DEBUG] Model dir: {_MODEL_DIR}", file=sys.stderr, flush=True)

    if not _MODEL_DIR.exists():
        print(f"[ERROR] Model dir not found: {_MODEL_DIR}", file=sys.stderr, flush=True)
        sys.exit(1)

    # warm-up: загружаем модель один раз до основного цикла (lru_cache)
    try:
        _dummy = demodulate([0.0] * 16, model_dir=str(_MODEL_DIR))
        print("[DEBUG] Model loaded OK", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"[ERROR] Model load failed: {e}", file=sys.stderr, flush=True)
        sys.exit(1)

    inq = Interrogator(port=port, baud=baud)
    inq.start()

    print("[DEBUG] Waiting for data...", file=sys.stderr, flush=True)
    time.sleep(2.0)

    try:
        while True:
            try:
                data = inq.read_avg_block(seconds=1.0, avg_sec=1.0)

                t_arr    = data["t_s"]
                mean_arr = data["mean"]   # (N, 16)
                std_arr  = data["std"]    # (N, 16)

                if len(t_arr) == 0:
                    continue

                i = len(t_arr) - 1

                P = [float(mean_arr[i][ch]) for ch in range(NCH)]

                # --- демодуляция ---
                try:
                    lam = demodulate(P, model_dir=str(_MODEL_DIR))  # np.ndarray(4,)
                except Exception as e:
                    print(f"[WARN] demodulate failed: {e}", file=sys.stderr, flush=True)
                    lam = [None, None, None, None]

                # --- формируем JSON ---
                row = {
                    "time": float(t_arr[i]),
                }

                for ch in range(NCH):
                    row[f"P{ch}"]      = float(mean_arr[i][ch])
                    row[f"stdDev{ch}"] = float(std_arr[i][ch])

                for fi in range(4):
                    v = lam[fi]
                    # nan → None (JSON null)
                    row[f"lam{fi + 1}"] = None if v is None or (hasattr(v, '__float__') and v != v) else float(v)

                print(json.dumps(row), flush=True)

            except TimeoutError as e:
                print(f"[DEBUG] Timeout: {e}", file=sys.stderr, flush=True)
                continue

    except KeyboardInterrupt:
        pass
    finally:
        inq.stop()


if __name__ == "__main__":
    main()
