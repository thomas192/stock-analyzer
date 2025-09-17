"""Data access helpers for JSON artefacts produced by notebooks.

Example:
    >>> from stock_analyzer.data_access import load_analysis_data
    >>> isinstance(load_analysis_data("AAPL"), dict)
    True
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Iterable

from .config import (
    ANALYSIS_DIR,
    DATA_DIR,
    DCF_DIR,
    SUMMARIES_DIR,
    TRANSCRIPTS_DIR,
)


def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception as exc:
        print(f"Error reading {path.name}: {exc}")
        return default


def load_analysis_data(ticker: str) -> dict[str, Any]:
    """Return cached analysis metrics for `ticker` or an empty dict."""
    return _read_json(ANALYSIS_DIR / f"{ticker}.json", {})


def load_dcf_data(ticker: str) -> dict[str, Any]:
    """Return cached DCF outputs for `ticker` or an empty dict."""
    return _read_json(DCF_DIR / f"{ticker}.json", {})


def load_transcript_data(ticker: str) -> list[dict[str, Any]]:
    """Return transcript payloads sorted newest-first for `ticker`."""
    pattern = f"{ticker}_*_transcript.json"
    transcripts = []
    for path in TRANSCRIPTS_DIR.glob(pattern):
        payload = _read_json(path, None)
        if not isinstance(payload, dict):
            continue
        if "year" not in payload or "quarter" not in payload:
            continue
        transcripts.append(payload)
    transcripts.sort(key=lambda item: (item.get("year", 1900), item.get("quarter", 0)), reverse=True)
    return transcripts


def load_transcript_summary(ticker: str, year: int, quarter: int) -> dict[str, Any]:
    """Return the generated summary payload for the requested quarter."""
    summary_file = SUMMARIES_DIR / f"{ticker}_{year}_Q{quarter}_summary.json"
    return _read_json(summary_file, {})


def delete_cache_files(ticker: str, filenames: Iterable[str] | None = None) -> None:
    """Remove cached financial statements for `ticker` if they exist."""
    names = filenames or (
        f"{ticker}_balance_sheet.json",
        f"{ticker}_cash_flow.json",
        f"{ticker}_income_statement.json",
    )
    for name in names:
        path = DATA_DIR / name
        if not path.exists():
            continue
        try:
            path.unlink()
            print(f"Deleted cache file: {path}")
        except Exception as exc:
            print(f"Error deleting {path}: {exc}")
