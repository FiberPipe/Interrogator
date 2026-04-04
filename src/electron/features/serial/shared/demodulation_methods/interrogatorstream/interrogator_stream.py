import argparse
import json
import os
import struct
import threading
import time
from collections import deque
from datetime import datetime
from pathlib import Path
from queue import SimpleQueue, Empty

import numpy as np
import serial

import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt

# ================== PROTOCOL ==================
SYNC_BYTES = b"\x55\xAA"          # Arduino sends 0xAA55 little-endian => 55 AA
PAYLOAD_LEN = 40                  # id(4) + t_us(4) + 16*uint16 (32)
FRAME_LEN = 2 + PAYLOAD_LEN + 2   # sync + payload + crc
UNPACK = struct.Struct("<II16H")  # rec_id, t_us, 16 adc

NCH = 16

# ================== CRC16-CCITT (table) ==================
def _crc16_table():
    poly = 0x1021
    table = []
    for i in range(256):
        crc = i << 8
        for _ in range(8):
            crc = ((crc << 1) ^ poly) & 0xFFFF if (crc & 0x8000) else (crc << 1) & 0xFFFF
        table.append(crc)
    return table

CRC_TABLE = _crc16_table()

def crc16_ccitt(data: bytes, init: int = 0xFFFF) -> int:
    crc = init
    for b in data:
        crc = ((crc << 8) & 0xFFFF) ^ CRC_TABLE[((crc >> 8) ^ b) & 0xFF]
    return crc & 0xFFFF

# ================== FILE WRITER (hour rotation) ==================
class SessionWriter:
    def __init__(self, base_dir: Path, flush_sec: float = 120.0):
        self.base_dir = base_dir
        self.flush_sec = flush_sec
        self.base_dir.mkdir(parents=True, exist_ok=True)

        self.meta_written = False
        self.raw_f = None
        self.avg_f = None
        self.current_hour_key = None
        self.last_flush = time.time()

    def write_meta_once(self):
        if self.meta_written:
            return
        meta = {
            "protocol": "OI_STREAM v1",
            "sync_hex": SYNC_BYTES.hex(),
            "frame_len": FRAME_LEN,
            "payload_len": PAYLOAD_LEN,
            "payload_struct": "<II16H",
            "fields": ["rec_id:uint32", "t_us:uint32(micros)", "adc[16]:uint16"],
            "crc": "CRC16-CCITT poly=0x1021 init=0xFFFF over payload(40 bytes)"
        }
        (self.base_dir / "format.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
        self.meta_written = True

    def _hour_key(self, dt: datetime) -> str:
        return dt.strftime("%Y-%m-%d_%H")

    def _rotate_if_needed(self, dt: datetime):
        hk = self._hour_key(dt)
        if hk == self.current_hour_key:
            return
        # rotate
        self.close_files()
        self.current_hour_key = hk
        raw_path = self.base_dir / f"raw_{hk}.bin"
        avg_path = self.base_dir / f"avg_{hk}.jsonl"
        self.raw_f = open(raw_path, "ab", buffering=1024 * 1024)
        self.avg_f = open(avg_path, "a", encoding="utf-8", buffering=1024 * 1024)

    def write_raw_frame(self, frame_bytes: bytes, dt: datetime):
        self.write_meta_once()
        self._rotate_if_needed(dt)
        self.raw_f.write(frame_bytes)

    def write_avg_point(self, obj: dict, dt: datetime):
        self.write_meta_once()
        self._rotate_if_needed(dt)
        self.avg_f.write(json.dumps(obj, ensure_ascii=False) + "\n")

    def maybe_flush(self):
        now = time.time()
        if now - self.last_flush >= self.flush_sec:
            if self.raw_f:
                self.raw_f.flush()
                os.fsync(self.raw_f.fileno())
            if self.avg_f:
                self.avg_f.flush()
                os.fsync(self.avg_f.fileno())
            self.last_flush = now

    def close_files(self):
        for f in (self.raw_f, self.avg_f):
            if f:
                try:
                    f.flush()
                except Exception:
                    pass
                try:
                    f.close()
                except Exception:
                    pass
        self.raw_f = None
        self.avg_f = None

# ================== STREAM READER THREAD ==================
class FrameReader(threading.Thread):
    def __init__(self, port: str, baud: int, out_q: SimpleQueue):
        super().__init__(daemon=True)
        self.port = port
        self.baud = baud
        self.out_q = out_q

        self.stop_flag = threading.Event()
        self.stats = {
            "bytes": 0,
            "frames": 0,
            "bad_crc": 0,
            "resync": 0,
        }

    def stop(self):
        self.stop_flag.set()

    def run(self):
        ser = serial.Serial(self.port, self.baud, timeout=0.1)
        buf = bytearray()

        try:
            while not self.stop_flag.is_set():
                chunk = ser.read(4096)
                if not chunk:
                    continue
                self.stats["bytes"] += len(chunk)
                buf.extend(chunk)

                # parse frames
                while True:
                    i = buf.find(SYNC_BYTES)
                    if i < 0:
                        # keep last byte (in case sync split)
                        if len(buf) > 1:
                            buf[:] = buf[-1:]
                        break
                    if i > 0:
                        # drop garbage before sync
                        del buf[:i]
                        self.stats["resync"] += 1

                    if len(buf) < FRAME_LEN:
                        break

                    frame = bytes(buf[:FRAME_LEN])
                    payload = frame[2:2+PAYLOAD_LEN]
                    crc_rx = struct.unpack_from("<H", frame, 2+PAYLOAD_LEN)[0]
                    crc_ok = (crc16_ccitt(payload) == crc_rx)

                    if not crc_ok:
                        self.stats["bad_crc"] += 1
                        # shift by 1 byte and retry (robust resync)
                        del buf[:1]
                        continue

                    # valid frame -> emit
                    rec_id, t_us, *adcs = UNPACK.unpack(payload)
                    self.stats["frames"] += 1
                    self.out_q.put({
                        "frame_bytes": frame,
                        "rec_id": rec_id,
                        "t_us": t_us,
                        "adc": np.array(adcs[::-1], dtype=np.uint16),  #reversed at 2026-03-27 after rack reassemby
                        "host_ts": time.perf_counter(),
                    })
                    del buf[:FRAME_LEN]
        finally:
            ser.close()

# ================== TIME UNWRAP (micros) ==================
class MicrosUnwrapper:
    def __init__(self):
        self.base = 0
        self.last = None
        self.t0 = None

    def push(self, t_us: int) -> float:
        if self.last is None:
            self.last = t_us
            self.t0 = t_us
            return 0.0
        # detect wrap (uint32)
        if t_us < self.last and (self.last - t_us) > 0x80000000:
            self.base += 0x100000000
        self.last = t_us
        t_abs = self.base + t_us
        t0_abs = self.base + self.t0  # ok for first segment
        return (t_abs - t0_abs) * 1e-6

# ================== ROLLING STATS ==================
class RollingWindow:
    """Either time-based (avg_sec) or count-based (avg_n) rolling stats for 16ch."""
    def __init__(self, avg_sec: float = None, avg_n: int = None):
        self.avg_sec = avg_sec
        self.avg_n = avg_n
        self.q = deque()
        self.sum = np.zeros(NCH, dtype=np.float64)
        self.sumsq = np.zeros(NCH, dtype=np.float64)

    def push(self, t_s: float, x_u16: np.ndarray):
        x = x_u16.astype(np.float64)
        self.q.append((t_s, x))
        self.sum += x
        self.sumsq += x * x

        if self.avg_n is not None:
            while len(self.q) > self.avg_n:
                _, old = self.q.popleft()
                self.sum -= old
                self.sumsq -= old * old

        if self.avg_sec is not None:
            t_min = t_s - self.avg_sec
            while self.q and self.q[0][0] < t_min:
                _, old = self.q.popleft()
                self.sum -= old
                self.sumsq -= old * old

    def mean_std(self):
        n = len(self.q)
        if n <= 0:
            return None, None, 0
        mean = self.sum / n
        var = np.maximum(self.sumsq / n - mean * mean, 0.0)
        std = np.sqrt(var)
        return mean, std, n

# ================== PLOTTING ==================
def init_plot():
    plt.ion()
    fig, axs = plt.subplots(4, 1, figsize=(12, 9), sharex=True)
    fig.canvas.manager.set_window_title("Interrogator live (mean/std)")

    # Status line in a reserved top margin (won't overlap axes/legends)
    status_text = fig.text(
        0.01, 0.995, "",
        ha="left", va="top", fontsize=9,
        bbox=dict(facecolor="white", alpha=0.85, edgecolor="none", pad=2.0),
    )

    lines = []
    bands = []

    for gi, ax in enumerate(axs):
        ax.grid(True, linestyle=":")
        ax.set_ylabel("ADC (mean)")
        chs = list(range(gi*4, gi*4+4))
        group_lines = []
        group_bands = []
        for ch in chs:
            (ln,) = ax.plot([], [], label=f"CH{ch}")
            band = ax.fill_between([], [], [], alpha=0.15)
            group_lines.append(ln)
            group_bands.append(band)
        ax.legend(loc="upper left", ncol=4, fontsize=9)
        lines.append(group_lines)
        bands.append(group_bands)

    axs[-1].set_xlabel("t, s")
    fig.tight_layout(rect=[0, 0, 1, 0.95])
    return fig, axs, lines, bands, status_text

def _band_verts(x, ylo, yhi):
    x = np.asarray(x, dtype=float)
    ylo = np.asarray(ylo, dtype=float)
    yhi = np.asarray(yhi, dtype=float)
    if x.size == 0:
        return [np.zeros((0, 2), dtype=float)]
    verts = np.column_stack([
        np.concatenate([x, x[::-1]]),
        np.concatenate([yhi, ylo[::-1]])
    ])
    return [verts]

def update_band(poly, x, ylo, yhi):
    """Update fill_between PolyCollection in-place and return it (for safety)."""
    if poly is None:
        return None
    verts = _band_verts(x, ylo, yhi)
    poly.set_verts(verts)
    poly.stale = True
    return poly


# ================== COMMANDS ==================
def cmd_probe(args):
    q = SimpleQueue()
    rd = FrameReader(args.port, args.baud, q)
    rd.start()

    t0 = time.time()
    got = 0
    uw = MicrosUnwrapper()

    try:
        while time.time() - t0 < args.seconds:
            try:
                item = q.get(timeout=0.5)
            except Empty:
                continue
            got += 1
            t_s = uw.push(item["t_us"])
            if got <= 5:
                print(f"frame#{got}: rec_id={item['rec_id']} t_s={t_s:.6f} adc0={int(item['adc'][0])}")
        st = rd.stats
        print(f"probe done: got={got} bytes={st['bytes']} frames={st['frames']} bad_crc={st['bad_crc']} resync={st['resync']}")
    finally:
        rd.stop()
        rd.join(timeout=1.0)

def cmd_record(args):
    # session dir
    root = Path(__file__).resolve().parent
    data_dir = root / "data"
    session = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    session_dir = data_dir / session
    print(f"Session dir: {session_dir}")

    writer = SessionWriter(session_dir, flush_sec=args.flush_sec)

    q = SimpleQueue()
    rd = FrameReader(args.port, args.baud, q)
    rd.start()

    uw = MicrosUnwrapper()
    t_start = time.time()
    last_print = time.time()

    try:
        while True:
            if args.duration is not None and (time.time() - t_start) >= args.duration:
                break

            try:
                item = q.get(timeout=0.2)
            except Empty:
                pass
            else:
                now_dt = datetime.now()
                if not args.no_raw:
                    writer.write_raw_frame(item["frame_bytes"], now_dt)
                # avg писать необязательно в record-режиме, но можно при желании
                writer.maybe_flush()

            if time.time() - last_print >= 1.0:
                st = rd.stats
                age = time.time() - t_start
                fps = st["frames"] / max(age, 1e-9)
                print(f"fps={fps:7.1f} frames={st['frames']} bad_crc={st['bad_crc']} resync={st['resync']}")
                last_print = time.time()
                raw_rate_mbh = fps * FRAME_LEN * 3600 / 1e6
                raw_total_mb = st["frames"] * FRAME_LEN / 1e6
                print(f"fps={fps:7.1f} frames={st['frames']} bad_crc={st['bad_crc']} resync={st['resync']} "
                    f"raw={'OFF' if args.no_raw else 'ON'} raw_rate≈{raw_rate_mbh:6.1f}MB/h total≈{raw_total_mb:7.1f}MB")


    finally:
        rd.stop()
        rd.join(timeout=1.0)
        writer.close_files()

def cmd_live(args):
    # session dir
    root = Path(__file__).resolve().parent
    data_dir = root / "data"
    session = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    session_dir = data_dir / session
    print(f"Session dir: {session_dir}")

    writer = SessionWriter(session_dir, flush_sec=args.flush_sec)

    q = SimpleQueue()
    rd = FrameReader(args.port, args.baud, q)
    rd.start()

    uw = MicrosUnwrapper()
    roll = RollingWindow(avg_sec=args.avg_sec, avg_n=args.avg_n)

    fig, axs, lines, bands, status_text = init_plot()

    # keep only a few minutes of downsampled (avg) points in RAM
    maxlen = max(200, int(args.window_sec * args.plot_hz * 3))
    t_avg = deque(maxlen=maxlen)
    y_avg = [deque(maxlen=maxlen) for _ in range(NCH)]
    s_avg = [deque(maxlen=maxlen) for _ in range(NCH)]

    last_plot = time.time()
    last_print = time.time()
    last_status_ui = 0.0
    t_start_wall = time.time()

    try:
        while True:
            # ---- pump incoming frames (fast, non-blocking) ----
            pumped = 0
            while True:
                try:
                    item = q.get_nowait()
                except Empty:
                    break
                pumped += 1
                t_s = uw.push(item["t_us"])
                roll.push(t_s, item["adc"])

                # raw write (full binary stream, split by hour)
                if not args.no_raw:
                    writer.write_raw_frame(item["frame_bytes"], datetime.now())

            now = time.time()

            # avoid 100% CPU when no data is coming
            if pumped == 0 and (now - last_plot) < (1.0 / args.plot_hz):
                time.sleep(0.001)

            # ---- plot update at fixed rate ----
            if now - last_plot >= (1.0 / args.plot_hz):
                mean, std, n = roll.mean_std()
                if mean is not None:
                    # append one averaged point
                    t_s = roll.q[-1][0]
                    t_avg.append(t_s)
                    for ch in range(NCH):
                        y_avg[ch].append(float(mean[ch]))
                        s_avg[ch].append(float(std[ch]))

                    x_full = np.asarray(t_avg, dtype=float)
                    t_last = float(x_full[-1])
                    t_min = t_last - float(args.window_sec)
                    mask = x_full >= t_min
                    x = x_full[mask]

                    # per-axis update (4 groups x 4 channels)
                    for gi, ax in enumerate(axs):
                        ymins = []
                        ymaxs = []
                        for li, ch in enumerate(range(gi * 4, gi * 4 + 4)):
                            y = np.asarray(y_avg[ch], dtype=float)[mask]
                            s = np.asarray(s_avg[ch], dtype=float)[mask]
                            lines[gi][li].set_data(x, y)
                            update_band(bands[gi][li], x, y - s, y + s)
                            if y.size:
                                ymins.append(float(np.min(y - s)))
                                ymaxs.append(float(np.max(y + s)))

                        ax.set_xlim(max(0.0, t_min), t_last)
                        if ymins and ymaxs:
                            ylo = min(ymins)
                            yhi = max(ymaxs)
                            if np.isfinite(ylo) and np.isfinite(yhi) and yhi > ylo:
                                pad = 0.05 * (yhi - ylo)
                                ax.set_ylim(ylo - pad, yhi + pad)

                    fig.canvas.draw_idle()
                    plt.pause(0.001)

                    # averaged point write (JSON Lines, split by hour)
                    writer.write_avg_point({
                        "t_s": float(t_s),
                        "n": int(n),
                        "mean_adc": [float(v) for v in mean],
                        "std_adc": [float(v) for v in std],
                    }, datetime.now())

                writer.maybe_flush()
                last_plot = now

            # ---- terminal stats (1 Hz) ----
            if now - last_print >= 1.0:
                st = rd.stats
                age = now - t_start_wall
                fps = st["frames"] / max(age, 1e-9)
                raw_rate_mbh = fps * FRAME_LEN * 3600 / 1e6
                raw_total_mb = st["frames"] * FRAME_LEN / 1e6
                print(
                    f"fps={fps:7.1f} frames={st['frames']} bad_crc={st['bad_crc']} resync={st['resync']} "
                    f"raw={'OFF' if args.no_raw else 'ON'} raw≈{raw_rate_mbh:6.1f} MB/h total≈{raw_total_mb:7.1f} MB"
                )
                last_print = now

            # ---- lightweight status line inside the figure (2 Hz) ----
            if now - last_status_ui >= 0.5:
                st = rd.stats
                age = now - t_start_wall
                fps = st["frames"] / max(age, 1e-9)
                raw_rate_mbh = fps * FRAME_LEN * 3600 / 1e6
                raw_total_mb = st["frames"] * FRAME_LEN / 1e6
                status_text.set_text(
                    f"fps={fps:.1f}  frames={st['frames']}  bad_crc={st['bad_crc']}  resync={st['resync']}  "
                    f"raw={'OFF' if args.no_raw else 'ON'}  raw≈{raw_rate_mbh:.1f} MB/h  total≈{raw_total_mb:.1f} MB"
                )
                last_status_ui = now

    except KeyboardInterrupt:
        pass
    finally:
        rd.stop()
        rd.join(timeout=1.0)
        writer.close_files()
# ================== MAIN ==================
def main():
    ap = argparse.ArgumentParser("OI interrogator stream")
    sub = ap.add_subparsers(dest="cmd", required=True)

    def add_common(p):
        p.add_argument("--port", required=True, help="COM port, e.g. COM6")
        p.add_argument("--baud", type=int, default=500000, help="Baudrate (recommend 500000 or 1000000)")
        p.add_argument("--flush-sec", type=float, default=120.0, help="Flush+fsync interval seconds")
        p.add_argument("--no-raw", action="store_true", help="Disable writing raw .bin stream (default: write raw)")

    p_probe = sub.add_parser("probe", help="quick check: do we parse frames?")
    add_common(p_probe)
    p_probe.add_argument("--seconds", type=float, default=3.0)

    p_record = sub.add_parser("record", help="record raw stream without UI")
    add_common(p_record)
    p_record.add_argument("--duration", type=float, default=None, help="seconds (omit -> until Ctrl+C)")

    p_live = sub.add_parser("live", help="live plot + record")
    add_common(p_live)
    p_live.add_argument("--avg-sec", type=float, default=1.0, help="rolling avg window in seconds")
    p_live.add_argument("--avg-n", type=int, default=None, help="alternative: rolling avg window in samples")
    p_live.add_argument("--plot-hz", type=float, default=10.0, help="plot refresh rate")
    p_live.add_argument("--window-sec", type=float, default=30.0, help="visible time window on plot")

    args = ap.parse_args()

    if args.cmd == "probe":
        cmd_probe(args)
    elif args.cmd == "record":
        cmd_record(args)
    elif args.cmd == "live":
        cmd_live(args)

if __name__ == "__main__":
    main()