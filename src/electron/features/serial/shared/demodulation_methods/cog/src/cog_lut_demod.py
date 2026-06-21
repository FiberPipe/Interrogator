# cog_lut_demod.py
# Fast online demodulation: P[16] -> lambda[4] using CoG + LUT artifacts

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict, Tuple

import numpy as np


# ====== CONFIG (edit if you want hardcoded path) ======
MODEL_ID = "cog_lut_v01"
# This assumes this file is in: demodulation_methods/cog/src/
DEFAULT_MODEL_DIR = Path(__file__).resolve().parents[1] / "models" / MODEL_ID
# ======================================================


@dataclass(frozen=True)
class _FBGModel:
    ch_idx: np.ndarray        # (M,) int
    baseline: np.ndarray      # (M,) float
    lam_ch: np.ndarray        # (M,) float
    lut_x: np.ndarray         # (K,) float, increasing
    lut_y: np.ndarray         # (K,) float


def _make_strictly_increasing(x: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Ensure x is strictly increasing by merging duplicates (x equal) with median y.
    """
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    m = np.isfinite(x) & np.isfinite(y)
    x = x[m]
    y = y[m]
    if x.size == 0:
        return x, y

    order = np.argsort(x)
    x = x[order]
    y = y[order]

    # merge duplicates
    ux, idx_start = np.unique(x, return_index=True)
    if ux.size == x.size:
        return x, y

    y_merged = np.empty_like(ux)
    for i in range(ux.size):
        a = idx_start[i]
        b = idx_start[i + 1] if i + 1 < ux.size else x.size
        y_merged[i] = np.median(y[a:b])
    return ux, y_merged


@lru_cache(maxsize=4)
def _load_model(model_dir: str | Path = DEFAULT_MODEL_DIR) -> Tuple[Tuple[str, ...], Dict[str, _FBGModel]]:
    """
    Load artifacts once and cache.
    Returns:
      order: ("FBG1","FBG2","FBG3","FBG4", ...) sorted by index
      models: dict fbg_key -> _FBGModel
    """
    model_dir = Path(model_dir)
    params_path = model_dir / "cog_params.json"
    lut_path = model_dir / "cog_lut.npz"

    with params_path.open("r", encoding="utf-8") as f:
        params = json.load(f)

    npz = np.load(lut_path)

    fbgs = params["fbgs"]
    # Stable order: FBG1..FBG4
    order = tuple(sorted(fbgs.keys(), key=lambda s: int(s.replace("FBG", ""))))

    models: Dict[str, _FBGModel] = {}
    for fbg in order:
        cfg = fbgs[fbg]
        chs = np.asarray(cfg["channels"], dtype=int)

        # baseline stored as {"13": 670.0, ...}
        base_map = cfg["baseline"]
        baseline = np.asarray([float(base_map[str(int(ch))]) for ch in chs], dtype=float)

        lam_ch = np.asarray(npz[f"{fbg}_lam_ch"], dtype=float)
        lut_x = np.asarray(npz[f"{fbg}_lut_x"], dtype=float)
        lut_y = np.asarray(npz[f"{fbg}_lut_y"], dtype=float)

        # Safety: enforce increasing LUT x
        lut_x, lut_y = _make_strictly_increasing(lut_x, lut_y)

        models[fbg] = _FBGModel(
            ch_idx=chs,
            baseline=baseline,
            lam_ch=lam_ch,
            lut_x=lut_x,
            lut_y=lut_y,
        )

    return order, models


def demodulate(P: np.ndarray, model_dir: str | Path = DEFAULT_MODEL_DIR) -> np.ndarray:
    """
    Fast demodulation for online use.

    Input:
      P: array-like shape (16,) with channel powers/codes in channel order 0..15 (same as postP0..postP15).

    Output:
      lam: np.ndarray shape (N_FBG,) in nm, order FBG1..FBG4 (or whatever is in the model).
           NaN if invalid (no power in selected window or outside LUT range).

    Notes:
      - Uses weights w = max(P[ch] - baseline[ch], 0)
      - CoG: lam_cog = sum(w*lam_ch)/sum(w)
      - LUT: lam = interp(lam_cog, lut_x, lut_y) (no extrapolation -> NaN)
    """
    p = np.asarray(P, dtype=float)
    if p.shape != (16,):
        p = p.reshape(-1)
        if p.size != 16:
            raise ValueError(f"P must have 16 elements, got {p.size}")

    order, models = _load_model(model_dir)

    out = np.empty(len(order), dtype=float)
    out.fill(np.nan)

    for i, fbg in enumerate(order):
        m = models[fbg]

        # gather selected channels
        pv = p[m.ch_idx]

        # weights
        w = pv - m.baseline
        # clip negative and non-finite
        w = np.where(np.isfinite(w) & (w > 0.0), w, 0.0)

        sumw = float(np.sum(w))
        if not np.isfinite(sumw) or sumw <= 0.0:
            continue

        # CoG
        lam_cog = float(np.dot(w, m.lam_ch) / sumw)
        if not np.isfinite(lam_cog):
            continue

        # LUT interpolation without extrapolation
        if lam_cog < m.lut_x[0] or lam_cog > m.lut_x[-1]:
            continue

        out[i] = float(np.interp(lam_cog, m.lut_x, m.lut_y))

    return out