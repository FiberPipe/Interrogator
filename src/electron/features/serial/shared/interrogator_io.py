"""
interrogator_io.py — minimal Python interface for the Arduino Mega2560 interrogator stream.

Protocol (frame = 44 bytes):
  SYNC (2) = 0xAA55  -> wire bytes: 55 AA (little-endian)
  payload (40) = rec_id:uint32 + t_us:uint32 + adc[16]:uint16
  crc16 (2) = CRC16-CCITT over payload only (poly 0x1021, init 0xFFFF)

Notes:
- COM port can only be opened by ONE process. Close interrogator_stream.py (live/record)
  or Arduino Serial Monitor before using this module.
"""

from __future__ import annotations

import struct
import threading
import time
from dataclasses import dataclass
from queue import SimpleQueue, Empty
from typing import Optional

import numpy as np
import serial

# -------------------- Protocol constants --------------------
SYNC_BYTES = b"\x55\xAA"          # 0xAA55 little-endian
PAYLOAD_LEN = 40
FRAME_LEN = 2 + PAYLOAD_LEN + 2  # sync + payload + crc
UNPACK = struct.Struct("<II16H")  # rec_id, t_us, 16 adc codes
NCH = 16

# -------------------- CRC16-CCITT --------------------
def _crc16_table():
    poly = 0x1021
    table = []
    for i in range(256):
        crc = i << 8
        for _ in range(8):
            crc = ((crc << 1) ^ poly) & 0xFFFF if (crc & 0x8000) else (crc << 1) & 0xFFFF
        table.append(crc)
    return table

_CRC_TABLE = _crc16_table()

def crc16_ccitt(data: bytes, init: int = 0xFFFF) -> int:
    """CRC16-CCITT (poly=0x1021), init=0xFFFF, no xorout."""
    crc = init
    for b in data:
        crc = ((crc << 8) & 0xFFFF) ^ _CRC_TABLE[((crc >> 8) ^ b) & 0xFF]
    return crc & 0xFFFF

# -------------------- Timestamp unwrap (micros) --------------------
class MicrosUnwrapper:
    """
    Unwrap 32-bit micros() rollover (~71.6 min on AVR).
    Returns t_s relative to the first seen timestamp.
    """
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

# -------------------- Reader thread --------------------
class FrameReader(threading.Thread):
    """
    Reads bytes from serial, finds SYNC, checks CRC, outputs parsed frames to a queue.
    """
    def __init__(self, port: str, baud: int, out_q: SimpleQueue, timeout: float = 0.1):
        super().__init__(daemon=True)
        self.port = port
        self.baud = baud
        self.timeout = timeout
        self.out_q = out_q
        self.stop_flag = threading.Event()

        self.stats = {
            "bytes": 0,
            "frames": 0,
            "bad_crc": 0,
            "resync": 0,
            "serial_errors": 0,
        }

    def stop(self):
        self.stop_flag.set()

    def run(self):
        try:
            ser = serial.Serial(self.port, self.baud, timeout=self.timeout)
        except Exception:
            self.stats["serial_errors"] += 1
            raise

        buf = bytearray()
        try:
            while not self.stop_flag.is_set():
                chunk = ser.read(4096)
                if not chunk:
                    continue
                self.stats["bytes"] += len(chunk)
                buf.extend(chunk)

                while True:
                    i = buf.find(SYNC_BYTES)
                    if i < 0:
                        # keep last byte (sync may be split)
                        if len(buf) > 1:
                            buf[:] = buf[-1:]
                        break

                    if i > 0:
                        del buf[:i]
                        self.stats["resync"] += 1

                    if len(buf) < FRAME_LEN:
                        break

                    frame = bytes(buf[:FRAME_LEN])
                    payload = frame[2:2 + PAYLOAD_LEN]
                    crc_rx = struct.unpack_from("<H", frame, 2 + PAYLOAD_LEN)[0]
                    if crc16_ccitt(payload) != crc_rx:
                        self.stats["bad_crc"] += 1
                        # robust resync: shift by 1 and retry
                        del buf[:1]
                        continue

                    rec_id, t_us, *adcs = UNPACK.unpack(payload)

                    self.stats["frames"] += 1
                    self.out_q.put({
                        "rec_id": rec_id,
                        "t_us": t_us,
                        "adc": np.array(adcs, dtype=np.uint16),
                        "host_ts": time.perf_counter(),
                    })
                    del buf[:FRAME_LEN]
        finally:
            try:
                ser.close()
            except Exception:
                pass

# -------------------- Public API --------------------
@dataclass
class InterrogatorBlock:
    t_s: np.ndarray        # (N,), float64 (unwrapped micros timeline)
    rec_id: np.ndarray     # (N,), uint32
    t_us: np.ndarray       # (N,), uint32
    adc: np.ndarray        # (N,16), uint16
    host_ts: np.ndarray    # (N,), float64 perf_counter timestamps

def adc_codes_to_volts(adc_codes: np.ndarray, vref_volts: float) -> np.ndarray:
    """10-bit ADC codes (0..1023) -> volts at Arduino ADC pin."""
    return adc_codes.astype(np.float64) * (vref_volts / 1023.0)

class Interrogator:
    """
    Notebook-friendly interface.
    - start(): open COM in background reader thread
    - read_block(seconds): record a fixed-duration block
    - stop(): release COM port
    """
    def __init__(self, port: str, baud: int = 500000):
        self.port = port
        self.baud = baud

        self._q: SimpleQueue = SimpleQueue()
        self._rd = FrameReader(port=self.port, baud=self.baud, out_q=self._q)
        self._uw = MicrosUnwrapper()

        self._running = False

    def start(self):
        if self._running:
            return
        self._rd.start()
        self._running = True

    def stop(self):
        if not self._running:
            return
        self._rd.stop()
        self._rd.join(timeout=1.0)
        self._running = False

    @property
    def stats(self) -> dict:
        return dict(self._rd.stats)

    def read_block(self, seconds: float, max_wait_s: float = 2.0) -> InterrogatorBlock:
        """
        Blocking acquisition for a fixed duration (wall clock).
        If no frames arrive for longer than max_wait_s, raises TimeoutError.
        """
        t_dead = time.time() + seconds
        last_rx = time.time()

        rec_ids, t_uses, t_ss, host_tss, adcs = [], [], [], [], []

        while time.time() < t_dead:
            try:
                item = self._q.get(timeout=0.2)
            except Empty:
                if time.time() - last_rx > max_wait_s:
                    raise TimeoutError(f"No frames received for {max_wait_s} s. COM port busy/wrong baud?")
                continue

            last_rx = time.time()
            t_s = self._uw.push(item["t_us"])

            rec_ids.append(item["rec_id"])
            t_uses.append(item["t_us"])
            t_ss.append(t_s)
            host_tss.append(item["host_ts"])
            adcs.append(item["adc"])

        if not rec_ids:
            raise TimeoutError("No frames captured in the requested interval.")

        adc_arr = np.vstack(adcs).astype(np.uint16)

        return InterrogatorBlock(
            t_s=np.asarray(t_ss, dtype=np.float64),
            rec_id=np.asarray(rec_ids, dtype=np.uint32),
            t_us=np.asarray(t_uses, dtype=np.uint32),
            adc=adc_arr,
            host_ts=np.asarray(host_tss, dtype=np.float64),
        )