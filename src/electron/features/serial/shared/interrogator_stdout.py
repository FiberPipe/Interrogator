# interrogator_stdout.py

import sys
import json
import time
import numpy as np
from pathlib import Path
from interrogator_io import Interrogator, NCH

# --- демодуляция ---
_SHARED_DIR = Path(__file__).resolve().parent
_DEMOD_SRC  = _SHARED_DIR / "demodulation_methods" / "cog" / "src"
_MODEL_DIR  = _SHARED_DIR / "demodulation_methods" / "cog" / "models" / "cog_lut_v01"

sys.path.insert(0, str(_DEMOD_SRC))
from cog_lut_demod import demodulate, _load_model  # noqa: E402


def _debug_demod(P: list, model_dir: str) -> None:
    """Диагностика: печатает в stderr причину nan для каждого FBG."""
    try:
        P_arr = np.array(P, dtype=float)
        order, models = _load_model(model_dir)

        for fbg in order:
            m = models[fbg]
            pv = P_arr[m.ch_idx]
            w_raw = pv - m.baseline
            w = np.where(np.isfinite(w_raw) & (w_raw > 0.0), w_raw, 0.0)
            sumw = float(np.sum(w))

            print(f"[DEBUG] {fbg}:", file=sys.stderr, flush=True)
            print(f"  ch_idx   = {m.ch_idx}", file=sys.stderr, flush=True)
            print(f"  pv       = {np.round(pv, 2)}", file=sys.stderr, flush=True)
            print(f"  baseline = {np.round(m.baseline, 2)}", file=sys.stderr, flush=True)
            print(f"  w_raw    = {np.round(w_raw, 2)}", file=sys.stderr, flush=True)
            print(f"  w_clip   = {np.round(w, 2)}", file=sys.stderr, flush=True)
            print(f"  sumw     = {sumw:.4f}", file=sys.stderr, flush=True)

            if sumw <= 0:
                print(f"  → FAIL: все веса <= 0 (P ниже baseline?)", file=sys.stderr, flush=True)
                continue

            lam_cog = float(np.dot(w, m.lam_ch) / sumw)
            print(f"  lam_cog  = {lam_cog:.6f}", file=sys.stderr, flush=True)
            print(f"  lut_x    = [{m.lut_x[0]:.6f}, {m.lut_x[-1]:.6f}]", file=sys.stderr, flush=True)

            if not np.isfinite(lam_cog):
                print(f"  → FAIL: lam_cog не finite", file=sys.stderr, flush=True)
            elif lam_cog < m.lut_x[0] or lam_cog > m.lut_x[-1]:
                print(f"  → FAIL: lam_cog вне диапазона LUT", file=sys.stderr, flush=True)
            else:
                print(f"  → OK", file=sys.stderr, flush=True)

    except Exception as ex:
        print(f"[DEBUG] _debug_demod failed: {ex}", file=sys.stderr, flush=True)


def _lam_to_json_val(v) -> float | None:
    """nan/None → None (JSON null), иначе float."""
    if v is None:
        return None
    try:
        f = float(v)
        return None if not np.isfinite(f) else f
    except Exception:
        return None


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

    # флаг: один раз выводим диагностику после первых реальных данных
    _debug_done = False

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

                # --- диагностика один раз по первым реальным данным ---
                if not _debug_done:
                    print("[DEBUG] First real P values:", file=sys.stderr, flush=True)
                    print(f"  P = {[round(x, 2) for x in P]}", file=sys.stderr, flush=True)
                    _debug_demod(P, str(_MODEL_DIR))
                    _debug_done = True

                # --- демодуляция ---
                try:
                    lam = demodulate(P, model_dir=str(_MODEL_DIR))
                except Exception as e:
                    print(f"[WARN] demodulate failed: {e}", file=sys.stderr, flush=True)
                    lam = [None, None, None, None]

                # --- формируем JSON ---
                row: dict = {"time": float(t_arr[i])}

                for ch in range(NCH):
                    row[f"P{ch}"]      = float(mean_arr[i][ch])
                    row[f"stdDev{ch}"] = float(std_arr[i][ch])

                for fi in range(4):
                    row[f"lam{fi + 1}"] = _lam_to_json_val(lam[fi])

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
